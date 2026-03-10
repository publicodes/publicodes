open Base
open Shared
open Jingoo
open Jg_types

let from_rule_name (rule_name : Rule_name.t) =
  Tstr (Rule_name.to_string rule_name)

let get_rule_str_unit (tree : Tree.t) (rule_name : Rule_name.t) : string option
    =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number (Some unit)) ->
      Some (Stdlib.Format.asprintf "%a" Shared.Units.pp unit)
  | _ ->
      None

let from_rule_type (tree : Tree.t) (rule_name : Rule_name.t) =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number _) ->
      Tstr "number"
  | Some (Literal String) ->
      Tstr "text"
  | Some (Literal Bool) ->
      Tstr "boolean"
  | Some (Literal Date) ->
      Tstr "date"
  | None ->
      Tstr "unknown"

let from_op : Shared.Shared_ast.binary_op -> tvalue = function
  | Shared.Shared_ast.Add ->
      Tstr "add"
  | Sub ->
      Tstr "sub"
  | Mul ->
      Tstr "mul"
  | Div ->
      Tstr "div"
  | Pow ->
      Tstr "pow"
  | Eq ->
      Tstr "eq"
  | NotEq ->
      Tstr "neq"
  | Lt ->
      Tstr "lt"
  | Gt ->
      Tstr "gt"
  | GtEq ->
      Tstr "gte"
  | LtEq ->
      Tstr "lte"
  | And ->
      Tstr "and"
  | Or ->
      Tstr "or"
  | Min ->
      Tstr "min"
  | Max ->
      Tstr "max"

let is_lazy : Shared_ast.binary_op -> bool = function
  | And | Or | Lt | Gt | GtEq | LtEq | Pow | Div | Mul ->
      true
  | Add | Sub | Eq | NotEq | Min | Max ->
      false

let meta_of_type_value typ value =
  Tobj [("meta_type", Tstr typ); ("meta_value", value)]

let find_title (meta : Shared_ast.rule_meta list) : string option =
  List.find_map meta ~f:(fun m ->
      match m with Shared_ast.Title t -> Some t | _ -> None )

let find_description (meta : Shared_ast.rule_meta list) : string option =
  List.find_map meta ~f:(fun m ->
      match m with Shared_ast.Description d -> Some d | _ -> None )

let metas_of_meta (meta : Shared_ast.rule_meta list) =
  Tlist
    (List.filter_map meta ~f:(fun meta ->
         match meta with
         | Title title ->
             Some (meta_of_type_value "title" @@ Tstr title)
         | Description desc ->
             Some (meta_of_type_value "description" @@ Tstr desc)
         | Note note ->
             Some (meta_of_type_value "note" @@ Tstr note)
         | Custom_meta meta ->
             Some
               (meta_of_type_value "custom" @@ Tstr (Yojson.Safe.to_string meta))
         | Public ->
             None ) )

let rule_of_type_value _type value =
  Tobj [("rule_type", Tstr _type); ("rule_value", value)]

let rule_of_number value units =
  let unit =
    match units with
    | Some u ->
        Tstr (Stdlib.Format.asprintf "%a" Units.pp u)
    | None ->
        Tnull
  in
  rule_of_type_value "number" @@ Tobj [("number", Tfloat value); ("unit", unit)]

let rule_of_text value = rule_of_type_value "text" @@ Tstr value

let rule_of_bool value = rule_of_type_value "bool" @@ Tbool value

let rule_of_date value =
  match value with
  | Eval_tree.Date (Day {day; month; year}) ->
      rule_of_type_value "date"
      @@ Tobj [("year", Tint year); ("month", Tint month); ("day", Tint day)]
  | Date (Month {month; year}) ->
      rule_of_type_value "date"
      @@ Tobj [("year", Tint year); ("month", Tint month)]
  | _ ->
      failwith "Unsupported date format"

let rule_of_null = rule_of_type_value "null" @@ Tnull

let rule_of_undefined = rule_of_type_value "undefined" @@ Tnull

let rule_of_round (mode : Shared_ast.rounding) (value_rule : tvalue)
    (precision_rule : tvalue) =
  let rounding_mode =
    match mode with
    | Nearest ->
        Tstr "nearest"
    | Up ->
        Tstr "up"
    | Down ->
        Tstr "down"
  in
  rule_of_type_value "round"
  @@ Tobj
       [ ("mode", rounding_mode)
       ; ("number", value_rule)
       ; ("precision", precision_rule) ]

let rule_of_condition (cond : tvalue) (then_rule : tvalue) (else_rule : tvalue)
    =
  rule_of_type_value "condition"
  @@ Tobj [("cond", cond); ("then", then_rule); ("_else", else_rule)]

let rule_of_binary_op op (left_rule : tvalue) (right_rule : tvalue) =
  rule_of_type_value "binary_op"
  @@ Tobj
       [ ("op", from_op op)
       ; ("lazy", Tbool (is_lazy op))
       ; ("left", left_rule)
       ; ("right", right_rule) ]

let rule_of_unary_op op (arg : tvalue) =
  rule_of_type_value "unary_op" @@ Tobj [("op", Tstr op); ("arg", arg)]

let rule_of_neg_op (arg : tvalue) = rule_of_unary_op "neg_op" arg

let rule_of_undef_op (arg : tvalue) = rule_of_unary_op "is_undef" arg

let rule_of_ref (name : string) = rule_of_type_value "ref" @@ Tstr name

let rule_of_get_ctx (name : string) = rule_of_type_value "get_ctx" @@ Tstr name

let rule_of_set_ctx (expr : tvalue) (items : (string * tvalue) list) =
  let items =
    List.map items ~f:(fun (name, value) ->
        Tobj [("name", Tstr name); ("value", value)] )
  in
  rule_of_type_value "set_ctx" @@ Tobj [("expr", expr); ("items", Tlist items)]

let rec rule_of_tree_val ({value; _} : Tree.value) =
  match value with
  | Eval_tree.Const (Eval_tree.Number (n, units)) ->
      rule_of_number n units
  | Const (String s) ->
      rule_of_text s
  | Const (Bool b) ->
      rule_of_bool b
  | Const (Date d) ->
      rule_of_date (Date d)
  | Const Null ->
      rule_of_null
  | Const Undefined ->
      rule_of_undefined
  | Round (mode, precision, value) ->
      rule_of_round mode (rule_of_tree_val value) (rule_of_tree_val precision)
  | Condition (cond, then_comp, else_comp) ->
      rule_of_condition (rule_of_tree_val cond)
        (rule_of_tree_val then_comp)
        (rule_of_tree_val else_comp)
  | Binary_op ((op, _), left, right) ->
      rule_of_binary_op op (rule_of_tree_val left) (rule_of_tree_val right)
  | Unary_op ((Neg, _), comp) ->
      rule_of_neg_op (rule_of_tree_val comp)
  | Unary_op ((Is_undef, _), comp) ->
      rule_of_undef_op (rule_of_tree_val comp)
  | Ref rule_name ->
      rule_of_ref (Rule_name.to_string rule_name)
  | Get_context rule_name ->
      rule_of_get_ctx (Rule_name.to_string rule_name)
  | Set_context {context; value} ->
      let context_items =
        List.map context ~f:(fun ((rule_name, _), value) ->
            (Rule_name.to_string rule_name, rule_of_tree_val value) )
      in
      rule_of_set_ctx (rule_of_tree_val value) context_items

let from_rules hashed_tree =
  let rules =
    Base.Hashtbl.fold hashed_tree ~init:[] ~f:(fun ~key:rule ~data acc ->
        let rule_type = from_rule_type hashed_tree rule in
        let rule_name = from_rule_name rule in
        let rule_data = rule_of_tree_val data in
        (rule_type, rule_name, rule_data) :: acc )
    |> List.sort ~compare:(fun (_, name1, _) (_, name2, _) ->
        String.compare (unbox_string name1) (unbox_string name2) )
  in
  Tlist
    (List.map rules ~f:(fun (rule_type, rule_name, rule_data) ->
         Tobj
           [ ("rule_type", rule_type)
           ; ("rule_name", rule_name)
           ; ("rule_data", rule_data) ] ) )

let from_output hashed_tree Model_outputs.{rule_name; parameters; meta; _} =
  let rule_type = from_rule_type hashed_tree rule_name in
  let title =
    find_title meta |> function None -> Tnull | Some str -> Tstr str
  in
  let description =
    find_description meta |> function None -> Tnull | Some str -> Tstr str
  in
  let return_type = from_rule_type hashed_tree rule_name in
  let metas = metas_of_meta meta in
  let params =
    Tlist
      (List.map parameters ~f:(fun p ->
           Tobj
             [ ("param_type", from_rule_type hashed_tree p)
             ; ("param_value", Tstr (Rule_name.to_string p)) ] ) )
  in
  let unit =
    get_rule_str_unit hashed_tree rule_name
    |> function None -> Tnull | Some str -> Tstr str
  in
  Tobj
    [ ("rule_type", rule_type)
    ; ("rule_name", Tstr (Rule_name.to_string rule_name))
    ; ("title", title)
    ; ("description", description)
    ; ("return_type", return_type)
    ; ("metas", metas)
    ; ("unit", unit)
    ; ("params", params) ]

let from_outputs hashed_tree outputs =
  Tlist (List.map outputs ~f:(from_output hashed_tree))

let models tree outputs =
  Utils.Template.from_rules_outputs (from_rules tree)
    (from_outputs tree outputs)
