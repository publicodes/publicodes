open Base
open Shared_ast

let to_mapping
    ({name= name, pos; value; meta; _} : Rule_name.t Shared_ast.rule_def) :
    Yojson.Basic.t =
  let to_pos (pos : Utils.Pos.pos) =
    let to_point (point : Utils.Pos.Point.t) =
      [ ("index", `Int point.index)
      ; ("line", `Int point.line)
      ; ("column", `Int point.column) ]
    in
    ( "position"
    , `Assoc
        [ ("file", `String pos.file)
        ; ("start", `Assoc (to_point pos.start_pos))
        ; ("end", `Assoc (to_point pos.end_pos)) ] )
  in
  let to_publicodes pos =
    let id = ("id", `String (Id.hash name pos)) in
    let pos = to_pos pos in
    ("_publicodes", `Assoc [id; pos])
  in
  let to_binop binop =
    match binop with
    | Add ->
        "addition"
    | Sub ->
        "substraction"
    | Mul ->
        "multiplication"
    | Div ->
        "division"
    | Pow ->
        "power"
    | Gt ->
        "greater than"
    | Lt ->
        "lower than"
    | GtEq ->
        "greater or equal than"
    | LtEq ->
        "lower or equal than"
    | Eq ->
        "equal to"
    | NotEq ->
        "not equal to"
    | And ->
        "and"
    | Or ->
        "or"
    | Max ->
        "max of"
    | Min ->
        "min of"
  in
  let to_unop unop = match unop with Neg -> "opposite of" in
  let to_meta meta =
    match meta with
    | Title title ->
        Some ("title", `String title)
    | Description desc ->
        Some ("description", `String desc)
    | Note note ->
        Some ("note", `String note)
    | Public ->
        Some ("public", `Bool true)
    | Module_id _ ->
        None
    | Custom_meta meta ->
        Some ("meta", Yojson.Safe.to_basic meta)
  in
  let to_const const : Yojson.Basic.t =
    let _type, parameters =
      match const with
      | Number (number, unit) ->
          let unit =
            match unit with
            | Some unit ->
                [("unit", `String (Stdlib.Format.asprintf "%a" Units.pp unit))]
            | None ->
                []
          in
          ("number", `Assoc (("value", `Float number) :: unit))
      | Bool bool ->
          ("boolean", `Assoc [("value", `Bool bool)])
      | String str ->
          ("string", `Assoc [("value", `String str)])
      | Date date ->
          let date =
            match date with
            | Day {day: int; year: int; month: int} ->
                `String (Stdlib.Format.asprintf "%d-%d-%d" year month day)
            | Month {month: int; year: int} ->
                `String (Stdlib.Format.asprintf "%d-%d" year month)
          in
          ("date", `Assoc [("value", date)])
    in
    `Assoc [("type", `String _type); ("parameters", parameters)]
  in
  let rec expr_to_mapping expr : Yojson.Basic.t =
    let _type, parameters =
      match expr with
      | Const const ->
          ("constant", to_const const)
      | Ref ref ->
          ("reference", `String (Rule_name.show ref))
      | Binary_op ((binop, _), (left, _), (right, _)) ->
          ( to_binop binop
          , `Assoc
              [("left", expr_to_mapping left); ("right", expr_to_mapping right)]
          )
      | Unary_op ((unop, _), (expr, _)) ->
          (to_unop unop, expr_to_mapping expr)
    in
    let _type = [("type", `String _type)] in
    let parameters = [("parameters", parameters)] in
    `Assoc (_type @ parameters)
  in
  let rec to_value_mec (value_meca, pos) : Yojson.Basic.t =
    let _type, value =
      match value_meca with
      | Expr (expr, _) ->
          ("expression", Some (expr_to_mapping expr))
      | Value value ->
          ("value", Some (`Assoc (to_mecs value)))
      | Is_applicable value ->
          ("is applicable", Some (`Assoc (to_mecs value)))
      | Is_not_applicable value ->
          ("is not applicable", Some (`Assoc (to_mecs value)))
      | Sum values ->
          ( "sumn"
          , Some
              (`List
                 (List.map values ~f:(function value -> `Assoc (to_mecs value)))
              ) )
      | Product values ->
          ( "product"
          , Some
              (`List
                 (List.map values ~f:(function value -> `Assoc (to_mecs value)))
              ) )
      | All_of values ->
          ( "all of"
          , Some
              (`List
                 (List.map values ~f:(function value -> `Assoc (to_mecs value)))
              ) )
      | Min_of values ->
          ( "min of"
          , Some
              (`List
                 (List.map values ~f:(function value -> `Assoc (to_mecs value)))
              ) )
      | Max_of values ->
          ( "max of"
          , Some
              (`List
                 (List.map values ~f:(function value -> `Assoc (to_mecs value)))
              ) )
      | One_of values ->
          ( "one of"
          , Some
              (`List
                 (List.map values ~f:(function value -> `Assoc (to_mecs value)))
              ) )
      | Not_defined ->
          ("not defined", None)
      | Variations (variations, else_) ->
          let variations : Yojson.Basic.t list =
            List.map variations ~f:(function {if_; then_} ->
                `Assoc
                  [ ("if", `Assoc (to_mecs if_))
                  ; ("then", `Assoc (to_mecs then_)) ] )
          in
          let parameters =
            match else_ with
            | None ->
                [("conditions", `List variations)]
            | Some else_ ->
                [ ("conditions", `List variations)
                ; ("else", `Assoc (to_mecs else_)) ]
          in
          ("variations", Some (`Assoc parameters))
    in
    let value =
      match value with None -> [] | Some value -> [("value", value)]
    in
    let _type = [("type", `String _type)] in
    `Assoc (_type @ [to_publicodes pos] @ value)
  and to_chain_mec (chain_meca, pos) : Yojson.Basic.t =
    let (_type : string), (value : Yojson.Basic.t) =
      match chain_meca with
      | Context contexts ->
          let contexts : (string * Yojson.Basic.t) list =
            List.map contexts ~f:(function (key, _), value ->
                (Rule_name.show key, `Assoc (to_mecs value)) )
          in
          ("context", `Assoc contexts)
      | Applicable_if value ->
          ("applicable if", `Assoc (to_mecs value))
      | Not_applicable_if value ->
          ("not applicable if", `Assoc (to_mecs value))
      | Type (typ, _) -> (
        match typ with
        | Literal String ->
            ("type", `Assoc [("type", `String "text")])
        | Literal Bool ->
            ("type", `Assoc [("type", `String "boolean")])
        | Literal Date ->
            ("type", `Assoc [("type", `String "date")])
        | Number unit ->
            let unit =
              match unit with
              | Some unit ->
                  Stdlib.Format.asprintf "%a" Units.pp unit
              | None ->
                  "nombre"
            in
            ("type", `Assoc [("type", `String unit)]) )
      | Default value ->
          ("default", `Assoc (to_mecs value))
      | Ceiling value ->
          ("ceiling", `Assoc (to_mecs value))
      | Floor value ->
          ("floor", `Assoc (to_mecs value))
      | Round (Up, value) ->
          ("round up", `Assoc (to_mecs value))
      | Round (Down, value) ->
          ("round down", `Assoc (to_mecs value))
      | Round (Nearest, value) ->
          ("round nearest", `Assoc (to_mecs value))
    in
    let _type = [("type", `String _type)] in
    let value = [("value", value)] in
    `Assoc (_type @ [to_publicodes pos] @ value)
  and to_mecs {value; chainable_mechanisms} : (string * Yojson.Basic.t) list =
    [ ("value mecanism", to_value_mec value)
    ; ( "chainable mecanisms"
      , `List (List.map chainable_mechanisms ~f:to_chain_mec) ) ]
  in
  let name = [("name", `String (Rule_name.show name))] in
  let meta = List.filter_map meta ~f:to_meta in
  let value = [("value", `Assoc (to_mecs value))] in
  `Assoc (name @ meta @ [to_publicodes pos] @ value)

let to_json (ast : Shared_ast.resolved) : Yojson.Basic.t =
  let rules = List.map ast ~f:to_mapping in
  `Assoc [("rules", `List rules)]

let to_str (ast : Shared_ast.resolved) : string =
  Yojson.Basic.pretty_to_string @@ to_json ast
