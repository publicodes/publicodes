open Core
open Eval_tree
open Pp
open Utils

(* Tag handler for terminal styling *)
let handle_tag formatter tag content =
  let open Format in
  match tag with
  | `Constant ->
      pp_print_string formatter "\027[32m" ;
      (* green *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Operator ->
      pp_print_string formatter "\027[35m" ;
      (* magenta *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Reference ->
      pp_print_string formatter "\027[2;36m" ;
      (* dim cyan *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Keyword ->
      pp_print_string formatter "\027[33m" ;
      (* yellow *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Structure ->
      pp_print_string formatter "\027[38;5;244m" ;
      (* gray *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Rule_name ->
      pp_print_string formatter "\027[34m" ;
      (* blue *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Rule_name_heading ->
      pp_print_string formatter "\027[1;34m" ;
      (* bold blue *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Context ->
      pp_print_string formatter "\027[31m" ;
      (* red *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Meta_key ->
      pp_print_string formatter "\027[2;90m" ;
      (* very dim dark gray - extremely subtle *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | `Meta ->
      pp_print_string formatter "\027[2;37m" ;
      (* dim white/gray - subtle but more visible than key *)
      to_fmt formatter content ;
      pp_print_string formatter "\027[0m"
  | _ ->
      to_fmt formatter content

(* Format constants with appropriate styling *)
let format_constant = function
  | Number (f, units) ->
      let num_str = Float.to_string f in
      let units_str =
        match units with
        | Some u ->
            " " ^ Format.asprintf "%a" Units.pp u
        | None ->
            ""
      in
      tag `Constant (text (num_str ^ units_str))
  | Bool b ->
      tag `Constant (text (Bool.to_string b))
  | String s ->
      tag `Constant (textf "\"%s\"" s)
  | Date d ->
      tag `Constant (text (Shared_ast.show_date d))
  | Undefined ->
      tag `Constant (text "undefined")
  | Null ->
      tag `Constant (text "null")

(* Format binary operators *)
let format_binary_op = function
  | Shared_ast.Add ->
      tag `Operator (text "+")
  | Shared_ast.Sub ->
      tag `Operator (text "-")
  | Shared_ast.Mul ->
      tag `Operator (text "*")
  | Shared_ast.Div ->
      tag `Operator (text "/")
  | Shared_ast.Pow ->
      tag `Operator (text "**")
  | Shared_ast.Eq ->
      tag `Operator (text "=")
  | Shared_ast.NotEq ->
      tag `Operator (text "!=")
  | Shared_ast.Lt ->
      tag `Operator (text "<")
  | Shared_ast.LtEq ->
      tag `Operator (text "<=")
  | Shared_ast.Gt ->
      tag `Operator (text ">")
  | Shared_ast.GtEq ->
      tag `Operator (text ">=")
  | Shared_ast.And ->
      tag `Operator (text "&&")
  | Shared_ast.Or ->
      tag `Operator (text "||")
  | Shared_ast.Max ->
      tag `Operator (text "max")
  | Shared_ast.Min ->
      tag `Operator (text "min")

(* Format unary operators *)
let format_unary_op = function
  | Neg ->
      tag `Operator (text "-")
  | Is_undef ->
      tag `Operator (text "is_undef")

(* Format rule names *)
let format_rule_name rule_name =
  tag `Rule_name (text (Rule_name.to_string rule_name))

(* Format rule names for headings *)
let format_rule_name_heading rule_name =
  tag `Rule_name_heading (text (Rule_name.to_string rule_name))

(* Main recursive formatter for values *)
let rec format_value ?(show_pos = false) ?meta_to_string value =
  let format_naked_value = function
    | Const c ->
        format_constant c
    | Condition (cond, then_val, else_val) ->
        vbox
          (concat
             [ hbox
                 (concat
                    [ tag `Keyword (text "if")
                    ; space
                    ; format_value ~show_pos ?meta_to_string cond ] )
             ; cut
             ; box ~indent:2
                 (concat
                    [ tag `Keyword (text "then")
                    ; space
                    ; format_value ~show_pos ?meta_to_string then_val ] )
             ; cut
             ; box ~indent:2
                 (concat
                    [ tag `Keyword (text "else")
                    ; space
                    ; format_value ~show_pos ?meta_to_string else_val ] ) ] )
    | Binary_op (op, left, right) ->
        let needs_parens v =
          match v.value with Binary_op _ | Unary_op _ -> true | _ -> false
        in
        let format_operand v =
          if needs_parens v then
            hbox
              (concat
                 [ tag `Structure (text "(")
                 ; format_value ~show_pos ?meta_to_string v
                 ; tag `Structure (text ")") ] )
          else format_value ~show_pos ?meta_to_string v
        in
        hbox
          (concat
             [ format_operand left
             ; space
             ; format_binary_op (Pos.value op)
             ; space
             ; format_operand right ] )
    | Unary_op (op, operand) ->
        hbox
          (concat
             [ format_unary_op (Pos.value op)
             ; space
             ; format_value ~show_pos ?meta_to_string operand ] )
    | Ref rule_name ->
        hbox (concat [tag `Reference (text "@"); format_rule_name rule_name])
    | Get_context rule_name ->
        hbox
          (concat
             [ tag `Context (text "get_context")
             ; tag `Structure (text "(")
             ; format_rule_name rule_name
             ; tag `Structure (text ")") ] )
    | Set_context ctx ->
        format_context ~show_pos ?meta_to_string ctx
    | Round (rounding, precision, value) ->
        let rounding_str =
          match rounding with
          | Shared_ast.Up ->
              "round up"
          | Shared_ast.Down ->
              "round down"
          | Shared_ast.Nearest ->
              "round"
        in
        vbox
          (concat
             [ box
                 (concat
                    [ tag `Keyword (text rounding_str)
                    ; space
                    ; tag `Keyword (text "to:")
                    ; space
                    ; format_value ~show_pos ?meta_to_string precision ] )
             ; cut
             ; box ~indent:2 (format_value ~show_pos ?meta_to_string value) ] )
  in
  let main_doc = format_naked_value value.value in
  let meta_doc =
    match meta_to_string with
    | None ->
        nop
    | Some to_string ->
        let meta_pairs = to_string value.meta in
        if List.is_empty meta_pairs then nop
        else
          let format_pair (key, value) =
            hbox
              (concat
                 [ tag `Meta_key (text key)
                 ; tag `Meta_key (text ":")
                 ; tag `Meta (text value) ] )
          in
          let pairs_doc =
            concat
              ~sep:(tag `Meta_key (text " "))
              (List.map meta_pairs ~f:format_pair)
          in
          hbox
            (concat
               [ space
               ; tag `Meta_key (text "[")
               ; pairs_doc
               ; tag `Meta_key (text "]") ] )
  in
  hbox (concat [main_doc; meta_doc])

(* Format context *)
and format_context ?(show_pos = false) ?meta_to_string {context; value} =
  let format_binding (rule_name, val_expr) =
    hbox
      (concat
         [ format_rule_name (Pos.value rule_name)
         ; space
         ; tag `Structure (text "=")
         ; space
         ; format_value ~show_pos ?meta_to_string val_expr ] )
  in
  let bindings_doc =
    match context with
    | [] ->
        nop
    | bindings ->
        let binding_docs = List.map bindings ~f:format_binding in
        vbox
          (concat
             [ tag `Context (text "with")
             ; space
             ; tag `Structure (text "{")
             ; cut
             ; box ~indent:2
                 (vbox
                    (concat
                       ~sep:(concat [tag `Structure (text ","); cut])
                       binding_docs ) )
             ; cut
             ; tag `Structure (text "}")
             ; space ] )
  in
  vbox
    (concat
       [ bindings_doc
       ; tag `Keyword (text "in")
       ; cut
       ; box ~indent:2 (format_value ~show_pos ?meta_to_string value) ] )

(* Format the entire evaluation tree *)
let format_eval_tree ?(show_pos = false) ?meta_to_string eval_tree =
  let rules = Hashtbl.to_alist eval_tree in
  let sorted_rules =
    List.sort rules ~compare:(fun (a, _) (b, _) -> Rule_name.compare a b)
  in
  let format_rule (rule_name, value) =
    vbox
      (concat
         [ hbox
             (concat
                [ format_rule_name_heading rule_name
                ; space
                ; tag `Structure (text ":") ] )
         ; cut
         ; box ~indent:4 (format_value ~show_pos ?meta_to_string value)
         ; cut ] )
  in
  let rule_docs = List.map sorted_rules ~f:format_rule in
  vbox (concat ~sep:cut rule_docs)

(* Print functions *)
let print_value ?(show_pos = false) ?meta_to_string value =
  let doc = format_value ~show_pos ?meta_to_string value in
  to_fmt_with_tags (Format.get_std_formatter ()) doc ~tag_handler:handle_tag ;
  Format.print_flush ()

let print_eval_tree ?(show_pos = false) ?meta_to_string eval_tree =
  let doc = format_eval_tree ~show_pos ?meta_to_string eval_tree in
  to_fmt_with_tags (Format.get_std_formatter ()) doc ~tag_handler:handle_tag ;
  Format.print_flush ()

let to_string_value ?(show_pos = false) ?meta_to_string value =
  let doc = format_value ~show_pos ?meta_to_string value in
  let buffer = Buffer.create 256 in
  let formatter = Format.formatter_of_buffer buffer in
  to_fmt_with_tags formatter doc ~tag_handler:handle_tag ;
  Format.pp_print_flush formatter () ;
  Buffer.contents buffer

let to_string_eval_tree ?(show_pos = false) ?meta_to_string eval_tree =
  let doc = format_eval_tree ~show_pos ?meta_to_string eval_tree in
  let buffer = Buffer.create 1024 in
  let formatter = Format.formatter_of_buffer buffer in
  to_fmt_with_tags formatter doc ~tag_handler:handle_tag ;
  Format.pp_print_flush formatter () ;
  Buffer.contents buffer
