open Base
open Shared
open Shared.Eval_tree

let rulename_to_js_identifier (rule_name : Rule_name.t) : string =
  Rule_name.to_string rule_name
  |> String.substr_replace_all ~pattern:" " ~with_:"_"
  (* It's impossible to have more than two consecutives spaces in a Publicodes rule name. *)
  |> String.substr_replace_all ~pattern:"_" ~with_:"__"
  (* Valid in latest ES version but not in olders ones *)
  |> String.substr_replace_all ~pattern:"." ~with_:"·"
  |> String.substr_replace_all ~pattern:"'" ~with_:"ʹ"
  |> String.substr_replace_all ~pattern:"-" ~with_:"__t__"
  |> String.substr_replace_all ~pattern:"«" ~with_:"__go__"
  |> String.substr_replace_all ~pattern:"»" ~with_:"__gf__"
  |> String.substr_replace_all ~pattern:"\"" ~with_:"__d__"
  |> String.substr_replace_all ~pattern:"€" ~with_:"__euro__"
  |> String.substr_replace_all ~pattern:"%" ~with_:"__pct__"
  |> String.substr_replace_all ~pattern:"²" ~with_:"__sq__"

let%test_unit "There should be no conflicts over JS identifiers" =
  let rulenames : Shared.Rule_name.t list =
    [ ["a"]
    ; ["a%"]
    ; ["a\""]
    ; ["a_"]
    ; ["a°"]
    ; ["a»"]
    ; ["A"]
    ; ["a$"]
    ; ["a€"]
    ; ["a²"]
    ; ["a a"]
    ; ["a'a"]
    ; ["a-a"]
    ; ["a_a"]
    ; ["a . b"]
    ; ["a'b"]
    ; ["a\"b"]
    ; ["a_b"]
    ; ["a b c"]
    ; ["a'b\"c"]
    ; ["a-b-c"]
    ; ["a\"b'c"]
    ; ["a\"b\"c"]
    ; ["a_b_c"]
    ; ["a_euro_"]
    ; ["a«b»c"]
    ; ["a__deg__"] ]
  in
  let rulename_js_ids =
    List.map rulenames ~f:rulename_to_js_identifier
    |> List.stable_dedup ~compare:String.compare
  in
  [%test_eq: int] (List.length rulenames) (List.length rulename_js_ids)

let rulename_to_ts_type_name (rule_name : Rule_name.t) : string =
  let capitalized = String.capitalize (rulename_to_js_identifier rule_name) in
  Printf.sprintf "%sParams" capitalized

(* -------------------- JSDoc Type Generation -------------------- *)

let get_rule_str_unit (tree : Tree.t) (rule_name : Rule_name.t) : string option
    =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number (Some unit)) ->
      Some (Stdlib.Format.asprintf "%a" Shared.Units.pp unit)
  | _ ->
      None

let get_rule_js_type (tree : Tree.t) (rule_name : Rule_name.t) : string =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number _) ->
      "number"
  | Some (Literal String) ->
      "string"
  | Some (Literal Bool) ->
      "boolean"
  | Some (Literal Date) ->
      "Date"
  | None ->
      "unknown"

let get_rule_publicodes_type (tree : Tree.t) (rule_name : Rule_name.t) : string
    =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number _) ->
      "number"
  | Some (Literal String) ->
      "text"
  | Some (Literal Bool) ->
      "boolean"
  | Some (Literal Date) ->
      "date"
  | None ->
      ""

let binary_op_to_js : Shared.Shared_ast.binary_op -> string = function
  | Shared.Shared_ast.Add ->
      "$add"
  | Sub ->
      "$sub"
  | Mul ->
      "$mul"
  | Div ->
      "$div"
  | Pow ->
      "$pow"
  | Eq ->
      "$eq"
  | NotEq ->
      "$neq"
  | Lt ->
      "$lt"
  | Gt ->
      "$gt"
  | GtEq ->
      "$gte"
  | LtEq ->
      "$lte"
  | And ->
      "$and"
  | Or ->
      "$or"
  | Min ->
      "$min"
  | Max ->
      "$max"

let is_lazy : Shared_ast.binary_op -> bool = function
  | And | Or | Lt | Gt | GtEq | LtEq | Pow | Div | Mul ->
      true
  | Add | Sub | Eq | NotEq | Min | Max ->
      false

(* -------------------- Pp-based value conversion -------------------- *)

let date_to_js_pp = function
  | Eval_tree.Date (Day {day; month; year}) ->
      Pp.textf "new Date('%d-%02d-%02d')" year month day
  | Date (Month {month; year}) ->
      Pp.textf "new Date('%02d-%02d')" year month
  | _ ->
      failwith "Unsupported date format in JS conversion"

let rec value_to_js_pp ({value; _} : Tree.value) =
  match value with
  | Eval_tree.Const (Eval_tree.Number (n, _)) ->
      Pp.textf "%.16g" n
  | Const (String s) ->
      let s =
        s
        |> String.strip ~drop:(Char.equal '\'')
        |> String.substr_replace_all ~pattern:"\"" ~with_:"\\\""
      in
      Pp.textf "\"%s\"" s
  | Const (Bool b) ->
      Pp.textf "%b" b
  | Const (Date d) ->
      date_to_js_pp (Date d)
  | Const Null ->
      Pp.text "null"
  | Const Undefined ->
      Pp.text "undefined"
  | Round (mode, precision, value) ->
      let rounding_mode =
        match mode with
        | Nearest ->
            Pp.text "'nearest'"
        | Up ->
            Pp.text "'up'"
        | Down ->
            Pp.text "'down'"
      in
      Pp.concat
        [ Pp.text "$round("
        ; rounding_mode
        ; Pp.text ", "
        ; value_to_js_pp value
        ; Pp.text ", () => "
        ; value_to_js_pp precision
        ; Pp.text ")" ]
  | Condition (cond, then_comp, else_comp) ->
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.text "$cond("
           ; Pp.break ~nspaces:0 ~shift:0
           ; value_to_js_pp cond
           ; Pp.text ","
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.text "() => "
           ; value_to_js_pp then_comp
           ; Pp.text ","
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.text "() => "
           ; value_to_js_pp else_comp
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.text ")" ] )
  | Binary_op ((op, _), left, right) ->
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.text (binary_op_to_js op)
           ; Pp.text "("
           ; Pp.break ~nspaces:0 ~shift:0
           ; value_to_js_pp left
           ; Pp.text ","
           ; Pp.break ~nspaces:1 ~shift:0
           ; (if is_lazy op then Pp.text "() => " else Pp.nop)
           ; value_to_js_pp right
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.text ")" ] )
  | Unary_op ((Neg, _), comp) ->
      Pp.concat [Pp.text "(- "; value_to_js_pp comp; Pp.text ")"]
  | Unary_op ((Is_undef, _), comp) ->
      Pp.concat [Pp.text "("; value_to_js_pp comp; Pp.text " === undefined)"]
  | Ref rule_name ->
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.text "$ref("
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.textf "\"%s\"," (Rule_name.to_string rule_name)
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.textf "_%s," (rulename_to_js_identifier rule_name)
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.text "ctx,"
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.text "params"
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.text ")" ] )
  | Get_context rule_name ->
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.text "$get("
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.textf "\"%s\"," (Rule_name.to_string rule_name)
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.text "ctx,"
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.text "params"
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.text ")" ] )
  | Set_context {context; value} ->
      let context_items =
        List.map context ~f:(fun ((rule_name, _), value) ->
            Pp.hovbox ~indent:2
              (Pp.concat
                 [ Pp.textf "\"%s\":" (Rule_name.to_string rule_name)
                 ; Pp.break ~nspaces:1 ~shift:0
                 ; value_to_js_pp value ] ) )
      in
      let context_str =
        Pp.concat_map
          ~sep:(Pp.concat [Pp.text ","; Pp.break ~nspaces:1 ~shift:0])
          ~f:Fn.id context_items
      in
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.text "((ctx) =>"
           ; Pp.break ~nspaces:1 ~shift:0
           ; value_to_js_pp value
           ; Pp.text ")("
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.hovbox ~indent:2
               (Pp.concat
                  [ Pp.text "{"
                  ; Pp.break ~nspaces:1 ~shift:0
                  ; Pp.text "...ctx,"
                  ; Pp.break ~nspaces:1 ~shift:0
                  ; context_str
                  ; Pp.break ~nspaces:1 ~shift:0
                  ; Pp.text "}" ] )
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.text ")" ] )

(* -------------------- Pp-based JSDoc generation -------------------- *)

let to_js_str_pp str =
  let js_str =
    str
    |> String.substr_replace_all ~pattern:"'" ~with_:"\\'"
    |> String.substr_replace_all ~pattern:"\n" ~with_:"\\n"
    |> String.substr_replace_all ~pattern:"\t" ~with_:"\\t"
  in
  Pp.textf "'%s'" js_str

let get_params_jsdoc_typedef_pp (tree : Tree.t) (rule_name : Rule_name.t)
    (parameters : Rule_name.t list) =
  let type_name = rulename_to_ts_type_name rule_name in
  let parameters_type =
    Pp.concat_map parameters
      ~f:(fun param ->
        let param_name = Rule_name.to_string param in
        let param_type = get_rule_js_type tree param in
        Pp.textf " *  '%s'?: %s | undefined" param_name param_type )
      ~sep:(Pp.concat [Pp.text ";"; Pp.newline])
  in
  Pp.box ~indent:0
    (Pp.concat
       [ Pp.verbatim "/**"
       ; Pp.newline
       ; Pp.verbatimf " * Parameters of \"%s\"" (Rule_name.to_string rule_name)
       ; Pp.newline
       ; Pp.verbatim " * @typedef {{"
       ; Pp.newline
       ; parameters_type
       ; Pp.newline
       ; Pp.verbatimf " * }} %s" type_name
       ; Pp.newline
       ; Pp.text " */" ] )

let get_evaluate_params_jsdoc_pp (tree : Tree.t) (rule_name : Rule_name.t) =
  let return_type = get_rule_js_type tree rule_name in
  let type_name = rulename_to_ts_type_name rule_name in
  Pp.box ~indent:0
    (Pp.concat
       [ Pp.text "/**"
       ; Pp.newline
       ; Pp.textf
           " * Evaluate \"%s\" with information on missing and needed \
            parameters"
           (Rule_name.to_string rule_name)
       ; Pp.newline
       ; Pp.textf " * @param {%s} [params={}]" type_name
       ; Pp.newline
       ; Pp.text " * @param {Object} [options={}]"
       ; Pp.newline
       ; Pp.text " * @param {boolean} [option.cache=false]"
       ; Pp.newline
       ; Pp.textf
           {| * @return {{
 *  value: %s | undefined | null;
 *  needed: Array<keyof %s>;
 *  missing: Array<keyof %s>
 * }}|}
           return_type type_name type_name
       ; Pp.newline
       ; Pp.text " */" ] )

let get_evaluate_jsdoc_pp (tree : Tree.t) (rule_name : Rule_name.t) =
  let return_type = get_rule_js_type tree rule_name in
  let type_name = rulename_to_ts_type_name rule_name in
  Pp.box ~indent:0
    (Pp.concat
       [ Pp.text "/**"
       ; Pp.newline
       ; Pp.textf " * Evaluate \"%s\"" (Rule_name.to_string rule_name)
       ; Pp.newline
       ; Pp.textf " * @param {%s} [params={}]" type_name
       ; Pp.newline
       ; Pp.text " * @param {Object} [options={}]"
       ; Pp.newline
       ; Pp.text " * @param {boolean} [option.cache=false]"
       ; Pp.newline
       ; Pp.textf " * @return {%s | undefined | null}" return_type
       ; Pp.newline
       ; Pp.text " */" ] )

let get_meta_properties_jsdoc_pp (meta : Shared_ast.rule_meta list)
    (rule_name_str : string) =
  let meta_docs =
    List.filter_map meta ~f:(fun meta ->
        match meta with
        | Title title ->
            Some
              (Pp.box ~indent:0
                 (Pp.concat
                    [ Pp.text "/** @type {string} */"
                    ; Pp.newline
                    ; Pp.text "title: "
                    ; to_js_str_pp title ] ) )
        | Description desc ->
            Some
              (Pp.box ~indent:0
                 (Pp.concat
                    [ Pp.text "/** @type {string} */"
                    ; Pp.newline
                    ; Pp.text "description: "
                    ; to_js_str_pp desc ] ) )
        | Note note ->
            Some
              (Pp.box ~indent:0
                 (Pp.concat
                    [ Pp.text "/** @type {string} */"
                    ; Pp.newline
                    ; Pp.text "note: "
                    ; to_js_str_pp note ] ) )
        | Custom_meta meta ->
            Some
              (Pp.box ~indent:0
                 (Pp.concat
                    [ Pp.textf "/** Custom meta of rule \"%s\" */" rule_name_str
                    ; Pp.newline
                    ; Pp.text "meta: "
                    ; Pp.text (Yojson.Safe.to_string meta)
                    ; Pp.text " /** @type {const} */" ] ) )
        | Public ->
            None )
  in
  Pp.concat_map ~sep:(Pp.concat [Pp.text ","; Pp.newline]) ~f:Fn.id meta_docs

(* -------------------- Main Code Generation Functions -------------------- *)

let rules_to_js_functions_pp hashed_tree =
  let rules =
    Base.Hashtbl.fold hashed_tree ~init:[] ~f:(fun ~key:rule ~data acc ->
        let rule_type = get_rule_js_type hashed_tree rule in
        let rule_name = rulename_to_js_identifier rule in
        let rule_data = value_to_js_pp data in
        (rule_type, rule_name, rule_data) :: acc )
    |> List.sort ~compare:(fun (_, name1, _) (_, name2, _) ->
           String.compare name1 name2 )
  in
  let function_docs =
    List.map rules ~f:(fun (rule_type, rule_name, rule_data) ->
        let return_type = Pp.verbatimf "return /** @type {%s} */" rule_type in
        let function_body =
          Pp.concat
            [ Pp.verbatim "("
            ; Pp.break ~nspaces:0 ~shift:2
            ; rule_data
            ; Pp.break ~nspaces:0 ~shift:(-2)
            ; Pp.verbatim ")" ]
        in
        Pp.box ~indent:0
          (Pp.concat
             [ Pp.textf "/** @type {Fn<%s>} */" rule_type
             ; Pp.newline
             ; Pp.textf "function _%s(ctx, params) {" rule_name
             ; Pp.break ~nspaces:1 ~shift:2
             ; return_type
             ; Pp.newline
             ; function_body
             ; Pp.newline
             ; Pp.text "}" ] ) )
  in
  Pp.concat_map ~sep:(Pp.concat [Pp.newline; Pp.newline]) ~f:Fn.id function_docs

let generate_rule_object_pp hashed_tree
    Model_outputs.{rule_name; parameters; meta; _} =
  let publicodes_rule_type = get_rule_publicodes_type hashed_tree rule_name in
  let rule_name_str = Rule_name.to_string rule_name in
  let rule_name_js = rulename_to_js_identifier rule_name in
  let type_name = rulename_to_ts_type_name rule_name in
  let params_typedef =
    get_params_jsdoc_typedef_pp hashed_tree rule_name parameters
  in
  let evaluate_jsdoc = get_evaluate_jsdoc_pp hashed_tree rule_name in
  let evaluate_params_jsdoc =
    get_evaluate_params_jsdoc_pp hashed_tree rule_name
  in
  let meta_properties = get_meta_properties_jsdoc_pp meta rule_name_str in
  let params_list =
    List.map parameters ~f:(fun p -> to_js_str_pp (Rule_name.to_string p))
  in
  let params_list_doc =
    if List.is_empty params_list then Pp.text "[]"
    else
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.text "["
           ; Pp.cut
           ; Pp.concat_map
               ~sep:(Pp.concat [Pp.text ","; Pp.break ~nspaces:1 ~shift:0])
               ~f:Fn.id params_list
           ; Pp.cut
           ; Pp.text "]" ] )
  in
  let unit_property =
    match get_rule_str_unit hashed_tree rule_name with
    | Some unit ->
        Pp.box ~indent:0
          (Pp.concat
             [ Pp.textf "/** @type {\"%s\"} */" unit
             ; Pp.newline
             ; Pp.textf "unit: \"%s\"," unit ] )
    | None ->
        Pp.nop
  in
  let evaluate_fun =
    Pp.concat
      [ Pp.verbatim "evaluate: (params = {}, options) =>"
      ; Pp.break ~nspaces:1 ~shift:2
      ; Pp.verbatimf "$evaluate(_%s, params, options).value," rule_name_js ]
  in
  let evaluate_params_fun =
    Pp.concat
      [ Pp.verbatim "evaluateParams: (params = {}, options) =>"
      ; Pp.break ~nspaces:1 ~shift:2
      ; Pp.verbatimf "$evaluate(_%s, params, options)," rule_name_js ]
  in
  Pp.concat
    [ to_js_str_pp rule_name_str
    ; Pp.text ": {"
    ; Pp.break ~nspaces:1 ~shift:2
    ; Pp.hovbox
        (Pp.concat
           [ params_typedef
           ; Pp.newline
           ; evaluate_jsdoc
           ; Pp.newline
           ; evaluate_fun
           ; Pp.newline
           ; evaluate_params_jsdoc
           ; Pp.newline
           ; evaluate_params_fun
           ; Pp.newline
           ; Pp.verbatimf "/** @type {\"%s\"} */" publicodes_rule_type
           ; Pp.newline
           ; Pp.verbatimf "type: \"%s\"," publicodes_rule_type
           ; Pp.newline
           ; unit_property
           ; ( if get_rule_str_unit hashed_tree rule_name |> Option.is_some then
                 Pp.newline
               else Pp.nop )
           ; Pp.verbatimf "/**"
           ; Pp.newline
           ; Pp.verbatimf " * Parameter list for \"%s\"" rule_name_str
           ; Pp.newline
           ; Pp.verbatimf " * @type {Array<keyof %s>}" type_name
           ; Pp.newline
           ; Pp.text " */"
           ; Pp.newline
           ; Pp.text "params: "
           ; params_list_doc
           ; Pp.text ","
           ; meta_properties ] )
    ; Pp.newline
    ; Pp.text "}" ]

let outputs_to_js_rules_pp hashed_tree outputs =
  Pp.concat_map outputs
    ~sep:(Pp.concat [Pp.text ","; Pp.newline])
    ~f:(generate_rule_object_pp hashed_tree)

let generate_header_pp runtime =
  Pp.concat ~sep:Pp.newline
    [ Pp.verbatim "/** Start embedded runtime */"
    ; Pp.verbatim runtime
    ; Pp.verbatim "/** End embedded runtime */" ]

let generate_private_rules_pp rules_doc =
  Pp.box ~indent:0
    (Pp.concat
       [ Pp.verbatim "/** Compiled private Publicodes rules */"
       ; Pp.newline
       ; Pp.newline
       ; rules_doc ] )

let generate_exports_pp outputs_doc =
  Pp.box
    (Pp.concat
       [ Pp.text "/** Exported outputs/inputs */"
       ; Pp.newline
       ; Pp.newline
       ; Pp.verbatim "const rules = {"
       ; Pp.break ~nspaces:1 ~shift:2
       ; Pp.hovbox outputs_doc
       ; Pp.space
       ; Pp.text "}"
       ; Pp.newline
       ; Pp.newline
       ; Pp.verbatim "export default rules;" ] )

let to_js tree outputs : string =
  let doc =
    Pp.box ~indent:0
      (Pp.concat
         [ generate_header_pp Js_runtime.runtime
         ; Pp.newline
         ; Pp.newline
         ; generate_private_rules_pp (rules_to_js_functions_pp tree)
         ; Pp.newline
         ; Pp.newline
         ; generate_exports_pp (outputs_to_js_rules_pp tree outputs) ] )
  in
  Stdlib.Format.asprintf "%a@?" Pp.to_fmt doc
