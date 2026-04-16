open Base

let rec to_value ({value; pos; meta= {typ; _}} : Tree.value) =
  let _type, value =
    match value with
    | Shared.Eval_tree.Const (Number (v, _)) ->
        ("constante", `Float v)
    | Shared.Eval_tree.Const (Bool v) ->
        ("constante", `Bool v)
    | Shared.Eval_tree.Const (String v) ->
        ("constante", `String v)
    (* TODO: improve date formating? *)
    | Shared.Eval_tree.Const (Date (Day {day: int; year: int; month: int})) ->
        ( "constante"
        , `String (Stdlib.Format.asprintf "%d-%02d-%02d" year month day) )
    | Shared.Eval_tree.Const (Date (Month {month: int; year: int})) ->
        ("constante", `String (Stdlib.Format.asprintf "%02d-%02d" year month))
    | Shared.Eval_tree.Const Not_defined ->
        ("constante", `String "not_defined")
    | Shared.Eval_tree.Const Not_applicable ->
        ("constante", `String "not_applicable")
    | Shared.Eval_tree.Condition (_if, _then, _else) ->
        ( "condition"
        , `Assoc
            [ ("si", to_value _if)
            ; ("alors", to_value _then)
            ; ("sinon", to_value _else) ] )
    | Shared.Eval_tree.Binary_op ((op, _), left, right) ->
        let op =
          match op with
          | Add ->
              "addition"
          | Sub ->
              "soustraction"
          | Mul ->
              "multiplication"
          | Div ->
              "division"
          | Pow ->
              "exponentiel"
          | Gt ->
              "plus grand que"
          | Lt ->
              "plus petit que"
          | GtEq ->
              "plus grand ou égal à"
          | LtEq ->
              "plus petit ou égal à"
          | Eq ->
              "égual à"
          | NotEq ->
              "pas égal à"
          | And ->
              "et"
          | Or ->
              "ou"
          | Max ->
              "le maximum de"
          | Min ->
              "le minimum de"
        in
        ( "operation binaire"
        , `Assoc
            [ ("type", `String op)
            ; ("gauche", to_value left)
            ; ("droite", to_value right) ] )
    | Shared.Eval_tree.Unary_op ((Neg, _), value) ->
        ( "operation unaire"
        , `Assoc [("type", `String "negatif de"); ("valeur", to_value value)] )
    | Shared.Eval_tree.Unary_op ((Is_not_defined, _), value) ->
        ( "operation unaire"
        , `Assoc [("type", `String "is not defined"); ("valeur", to_value value)]
        )
    | Shared.Eval_tree.Ref name ->
        ("reference", `String (Shared.Rule_name.show name))
    | Shared.Eval_tree.Get_context name ->
        (* TODO: name this *)
        ("get_context?", `String (Shared.Rule_name.show name))
    | Shared.Eval_tree.Set_context ctx ->
        let ctxs =
          List.map ctx.context ~f:(function (name, _), value ->
              `Assoc
                [ ("name", `String (Shared.Rule_name.show name))
                ; ("valeur", to_value value) ] )
        in
        ( "contexte"
        , `Assoc [("context", `List ctxs); ("valeur", to_value ctx.value)] )
    | Shared.Eval_tree.Round (mode, precision, value) ->
        let mode =
          match mode with Up -> "up" | Down -> "down" | Nearest -> "nearest"
        in
        ( "arrondi"
        , `Assoc
            [ ("mode", `String mode)
            ; ("precicion", to_value precision)
            ; ("valeur", to_value value) ] )
  in
  let typ =
    match typ with
    | Some (Literal String) ->
        `String "string"
    | Some (Literal Bool) ->
        `String "booléan"
    | Some (Literal Date) ->
        `String "date"
    | Some (Number (Some units)) ->
        `String (Stdlib.Format.asprintf "%a" Shared.Units.pp units)
    | Some (Number None) ->
        `Null
    | None ->
        `Null
  in
  let id = Utils.Pos.hash pos in
  `Assoc
    [ ("type", `String _type)
    ; ("unité", typ)
    ; ("id", `String id)
    ; ("valeur", value) ]

let to_rules ((name, value) : Shared.Rule_name.t * Tree.value) =
  (Shared.Rule_name.show name, to_value value)

let to_json (ast : Tree.t) : Yojson.Basic.t =
  let rules = Hashtbl.to_alist ast |> List.map ~f:to_rules in
  `Assoc rules

let to_str (ast : Tree.t) : string =
  Yojson.Basic.pretty_to_string @@ to_json ast
