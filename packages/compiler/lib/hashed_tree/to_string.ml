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

let from_typ_opt : Typ.t option -> tvalue = function
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

let from_rule_type (tree : Tree.t) (rule_name : Rule_name.t) =
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  from_typ_opt typ

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
             None
         | Module_id _ ->
             None ) )

let node_of (kind : string) (value : tvalue) (id : Shared.Id.t)
    (typ_opt : Typ.t option) =
  let id = Shared.Id.to_string id in
  Tobj
    [ ("node_id", Tstr id)
    ; ("node_kind", Tstr kind)
    ; ("node_type", from_typ_opt typ_opt)
    ; ("node_value", value) ]

let node_of_number value units =
  let unit =
    match units with
    | Some u ->
        Tstr (Stdlib.Format.asprintf "%a" Units.pp u)
    | None ->
        Tnull
  in
  let value = Tobj [("number", Tfloat value); ("unit", unit)] in
  node_of "number" value

let node_of_text value = node_of "text" (Tstr value)

let node_of_bool value = node_of "bool" (Tbool value)

let node_of_date value =
  match value with
  | Eval_tree.Date (Day {day; month; year}) ->
      node_of "date"
        (Tobj [("year", Tint year); ("month", Tint month); ("day", Tint day)])
  | Date (Month {month; year}) ->
      node_of "date" (Tobj [("year", Tint year); ("month", Tint month)])
  | _ ->
      failwith "Unsupported date format"

let node_of_not_applicable = node_of "not_applicable" Tnull

let node_of_not_defined = node_of "not_defined" Tnull

let node_of_round (mode : Shared_ast.rounding) (value_rule : tvalue)
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
  node_of "round"
    (Tobj
       [ ("mode", rounding_mode)
       ; ("number", value_rule)
       ; ("precision", precision_rule) ] )

let node_of_condition (cond : tvalue) (then_rule : tvalue) (else_rule : tvalue)
    =
  node_of "condition"
    (Tobj [("cond", cond); ("then", then_rule); ("_else", else_rule)])

let node_of_binary_op op (left_rule : tvalue) (right_rule : tvalue) =
  node_of "binary_op"
    (Tobj
       [ ("op", from_op op)
       ; ("lazy", Tbool (is_lazy op))
       ; ("left", left_rule)
       ; ("right", right_rule) ] )

let node_of_unary_op op (arg : tvalue) =
  node_of "unary_op" (Tobj [("op", Tstr op); ("arg", arg)])

let node_of_neg_op (arg : tvalue) = node_of_unary_op "neg_op" arg

let node_of_is_not_defined_op (arg : tvalue) =
  node_of_unary_op "is_not_defined_op" arg

let node_of_ref (name : string) = node_of "ref" (Tstr name)

let node_of_get_ctx (name : string) = node_of "get_ctx" (Tstr name)

let node_of_set_ctx (expr : tvalue) (items : (string * tvalue) list) =
  let items =
    List.map items ~f:(fun (name, value) ->
        Tobj [("name", Tstr name); ("value", value)] )
  in
  node_of "set_ctx" (Tobj [("expr", expr); ("items", Tlist items)])

let rec node_of_tree_val (name : Shared.Rule_name.t)
    ({value; pos; meta} : Tree.value) =
  let id = Shared.Id.hash name pos in
  let node_of_tree_val = node_of_tree_val name in
  match value with
  | Eval_tree.Const (Eval_tree.Number (n, units)) ->
      node_of_number n units id meta.typ
  | Const (String s) ->
      node_of_text s id meta.typ
  | Const (Bool b) ->
      node_of_bool b id meta.typ
  | Const (Date d) ->
      node_of_date (Date d) id meta.typ
  | Const Not_applicable ->
      node_of_not_applicable id meta.typ
  | Const Not_defined ->
      node_of_not_defined id meta.typ
  | Round (mode, precision, value) ->
      node_of_round mode (node_of_tree_val value)
        (node_of_tree_val precision)
        id meta.typ
  | Condition (cond, then_comp, else_comp) ->
      node_of_condition (node_of_tree_val cond)
        (node_of_tree_val then_comp)
        (node_of_tree_val else_comp)
        id meta.typ
  | Binary_op ((op, _), left, right) ->
      node_of_binary_op op (node_of_tree_val left) (node_of_tree_val right) id
        meta.typ
  | Unary_op ((Neg, _), comp) ->
      node_of_neg_op (node_of_tree_val comp) id meta.typ
  | Unary_op ((Is_not_defined, _), comp) ->
      node_of_is_not_defined_op (node_of_tree_val comp) id meta.typ
  | Ref rule_name ->
      node_of_ref (Rule_name.to_string rule_name) id meta.typ
  | Get_context rule_name ->
      node_of_get_ctx (Rule_name.to_string rule_name) id meta.typ
  | Set_context {context; value} ->
      let context_items =
        List.map context ~f:(fun ((rule_name, _), value) ->
            (Rule_name.to_string rule_name, node_of_tree_val value) )
      in
      node_of_set_ctx (node_of_tree_val value) context_items id meta.typ

let from_rules hashed_tree =
  let rules =
    Base.Hashtbl.fold hashed_tree ~init:[] ~f:(fun ~key:rule ~data acc ->
        let rule_type = from_rule_type hashed_tree rule in
        let rule_name = from_rule_name rule in
        let rule_node = node_of_tree_val rule data in
        (rule_type, rule_name, rule_node) :: acc )
    |> List.sort ~compare:(fun (_, name1, _) (_, name2, _) ->
        String.compare (unbox_string name1) (unbox_string name2) )
  in
  Tlist
    (List.map rules ~f:(fun (rule_type, rule_name, rule_node) ->
         Tobj
           [ ("rule_type", rule_type)
           ; ("rule_name", rule_name)
           ; ("rule_node", rule_node) ] ) )

let from_output hashed_tree
    Model_output.{rule_name; parameters; meta; is_output; _} =
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
    ; ("is_output", Tbool is_output)
    ; ("params", params) ]

let from_outputs hashed_tree outputs =
  Tlist (List.map outputs ~f:(from_output hashed_tree))

let models ?with_runtime tree outputs =
  let rules = from_rules tree in
  let outputs = from_outputs tree outputs in
  let model = [("rules", rules); ("outputs", outputs)] in
  match with_runtime with
  | Some runtime ->
      ("runtime", Tstr runtime) :: model
  | None ->
      model

let to_js tree outputs =
  let model = models tree outputs ~with_runtime:Template_js.runtime in
  Utils.Template.from_template Template_js.template model

let to_debug ?(show_types = false) tree outputs =
  let model =
    (if show_types then [("show_types", Tbool true)] else [])
    @ models tree outputs
  in
  Utils.Template.from_template Template_debug.template model
