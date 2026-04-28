open Base

let rec to_value name ({value; pos; meta= {typ; _}} : Tree.value) =
  let _type, value =
    match value with
    | Shared.Eval_tree.Const (Number (v, _)) ->
        ("number", `Float v)
    | Shared.Eval_tree.Const (Bool v) ->
        ("bool", `Bool v)
    | Shared.Eval_tree.Const (String v) ->
        ("string", `String v)
    (* TODO: improve date formating? *)
    | Shared.Eval_tree.Const (Date (Day {day: int; year: int; month: int})) ->
        ("date", `String (Stdlib.Format.asprintf "%d-%02d-%02d" year month day))
    | Shared.Eval_tree.Const (Date (Month {month: int; year: int})) ->
        ("date", `String (Stdlib.Format.asprintf "%02d-%02d" year month))
    | Shared.Eval_tree.Const Not_defined ->
        ("not_defined", `String "not_defined")
    | Shared.Eval_tree.Const Not_applicable ->
        ("not_applicable", `String "not_applicable")
    | Shared.Eval_tree.Condition (_if, _then, _else) ->
        ( "condition"
        , `Assoc
            [ ("if", to_value name _if)
            ; ("then", to_value name _then)
            ; ("else", to_value name _else) ] )
    | Shared.Eval_tree.Binary_op ((op, _), left, right) ->
        let op =
          match op with
          | Add ->
              "add"
          | Sub ->
              "sub"
          | Mul ->
              "mult"
          | Div ->
              "div"
          | Pow ->
              "pow"
          | Gt ->
              "gt"
          | Lt ->
              "lt"
          | GtEq ->
              "gte"
          | LtEq ->
              "lte"
          | Eq ->
              "eq"
          | NotEq ->
              "ne"
          | And ->
              "and"
          | Or ->
              "or"
          | Max ->
              "max"
          | Min ->
              "min"
        in
        ( "binary_op"
        , `Assoc
            [ ("type", `String op)
            ; ("left", to_value name left)
            ; ("right", to_value name right) ] )
    | Shared.Eval_tree.Unary_op ((Neg, _), value) ->
        ( "unary_op"
        , `Assoc [("type", `String "neg"); ("value", to_value name value)] )
    | Shared.Eval_tree.Unary_op ((Is_not_defined, _), value) ->
        ( "unary_op"
        , `Assoc
            [("type", `String "not_defined"); ("value", to_value name value)] )
    | Shared.Eval_tree.Ref name ->
        ("ref", `String (Shared.Rule_name.show name))
    | Shared.Eval_tree.Get_context name ->
        ("get_context", `String (Shared.Rule_name.show name))
    | Shared.Eval_tree.Set_context ctx ->
        let ctxs =
          List.map ctx.context ~f:(function (name, _), value ->
              `Assoc
                [ ("name", `String (Shared.Rule_name.show name))
                ; ("value", to_value name value) ] )
        in
        ( "set_context"
        , `Assoc [("context", `List ctxs); ("value", to_value name ctx.value)]
        )
    | Shared.Eval_tree.Round (mode, precision, value) ->
        let mode =
          match mode with Up -> "up" | Down -> "down" | Nearest -> "nearest"
        in
        ( "round"
        , `Assoc
            [ ("mode", `String mode)
            ; ("precision", to_value name precision)
            ; ("value", to_value name value) ] )
  in
  let typ =
    match typ with
    | Some (Literal String) ->
        `String "string"
    | Some (Literal Bool) ->
        `String "bool"
    | Some (Literal Date) ->
        `String "date"
    | Some (Number (Some units)) ->
        if Map.is_empty units then `Null
        else `String (Stdlib.Format.asprintf "%a" Shared.Units.pp units)
    | Some (Number None) ->
        `Null
    | None ->
        `Null
  in
  let id = Shared.Id.hash name pos in
  `Assoc
    [ ("type", `String _type)
    ; ("unit", typ)
    ; ("id", `String id)
    ; ("value", value) ]

let to_rules ((name, value) : Shared.Rule_name.t * Tree.value) =
  (Shared.Rule_name.show name, to_value name value)

let to_json (ast : Tree.t) : Yojson.Basic.t =
  let rules = Hashtbl.to_alist ast |> List.map ~f:to_rules in
  `Assoc rules

let to_str (ast : Tree.t) : string =
  Yojson.Basic.pretty_to_string @@ to_json ast
