open Base
open Shared_ast

let to_point (point : Utils.Pos.Point.t) =
  [ ("index", `Int point.index)
  ; ("line", `Int point.line)
  ; ("column", `Int point.column) ]

let to_pos (pos : Utils.Pos.pos) =
  ( "position"
  , `Assoc
      [ ("file", `String pos.file)
      ; ("start", `Assoc (to_point pos.start_pos))
      ; ("end", `Assoc (to_point pos.end_pos)) ] )

let to_publicodes name pos =
  let id_str = Id.hash name pos |> Id.to_string in
  let id = ("id", `String id_str) in
  let pos = to_pos pos in
  ("_publicodes", `Assoc [id; pos])

let to_binop binop =
  Shared_ast.sexp_of_binary_op binop |> Sexp.to_string |> String.lowercase

let to_unop unop =
  Shared_ast.sexp_of_unary_op unop |> Sexp.to_string |> String.lowercase

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
        ("bool", `Assoc [("value", `Bool bool)])
    | String str ->
        ("string", `Assoc [("value", `String str)])
    | Symbol str ->
        ("symbol", `Assoc [("value", `String str)])
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

let rec expr_to_mapping expr : Yojson.Basic.t =
  let _type, parameters =
    match expr with
    | Const const ->
        ("constant", to_const const)
    | Ref ref ->
        ("ref", `String (Rule_name.show ref))
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

let rec to_value_mec name (value_meca, pos) : Yojson.Basic.t =
  let _type, parameters =
    match value_meca with
    | Expr (expr, _) ->
        ("expr", Some (expr_to_mapping expr))
    | Value value ->
        ("value", Some (`Assoc (to_mecs name value)))
    | Is_applicable value ->
        ("is_applicable", Some (`Assoc (to_mecs name value)))
    | Is_not_applicable value ->
        ("is_not_applicable", Some (`Assoc (to_mecs name value)))
    | Sum values ->
        ( "sum"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mecs name value) )) ) )
    | Product values ->
        ( "product"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mecs name value) )) ) )
    | All_of values ->
        ( "all_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mecs name value) )) ) )
    | Min_of values ->
        ( "min_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mecs name value) )) ) )
    | Max_of values ->
        ( "max_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mecs name value) )) ) )
    | One_of values ->
        ( "one_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mecs name value) )) ) )
    | Not_defined ->
        ("not_defined", None)
    | Variations (variations, else_) ->
        let variations : Yojson.Basic.t list =
          List.map variations ~f:(function {if_; then_} ->
              `Assoc
                [ ("if", `Assoc (to_mecs name if_))
                ; ("then", `Assoc (to_mecs name then_)) ] )
        in
        let value =
          match else_ with
          | None ->
              [("conditions", `List variations)]
          | Some else_ ->
              [ ("conditions", `List variations)
              ; ("else", `Assoc (to_mecs name else_)) ]
        in
        ("variations", Some (`Assoc value))
  in
  let parameters =
    match parameters with
    | None ->
        []
    | Some parameters ->
        [("parameters", parameters)]
  in
  let _type = [("type", `String _type)] in
  `Assoc (_type @ [to_publicodes name pos] @ parameters)

and to_chain_mec name (chain_meca, pos) : Yojson.Basic.t =
  let (_type : string), (parameters : Yojson.Basic.t) =
    match chain_meca with
    | Context contexts ->
        let contexts : (string * Yojson.Basic.t) list =
          List.map contexts ~f:(function (key, _pos), value ->
              (Rule_name.show key, `Assoc (to_mecs name value)) )
        in
        ("context", `Assoc contexts)
    | Applicable_if value ->
        ("applicable_if", `Assoc (to_mecs name value))
    | Not_applicable_if value ->
        ("not_applicable_if", `Assoc (to_mecs name value))
    | Type (typ, _) -> (
      match typ with
      | Literal String ->
          ("type", `Assoc [("type", `String "text")])
      | Literal Bool ->
          ("type", `Assoc [("type", `String "boolean")])
      | Literal Date ->
          ("type", `Assoc [("type", `String "date")])
      | Symbol _ ->
          failwith "unreachable" (* there is no type symbol *)
      | Enum _ ->
          failwith "unreachable" (* there is no type enum *)
      | Number unit ->
          let unit =
            match unit with
            | Some unit ->
                Stdlib.Format.asprintf "%a" Units.pp unit
            | None ->
                "number"
          in
          ("type", `Assoc [("type", `String unit)]) )
    | Default value ->
        ("default", `Assoc (to_mecs name value))
    | Ceiling value ->
        ("ceiling", `Assoc (to_mecs name value))
    | Floor value ->
        ("floor", `Assoc (to_mecs name value))
    | Round (Up, value) ->
        ("round up", `Assoc (to_mecs name value))
    | Round (Down, value) ->
        ("round down", `Assoc (to_mecs name value))
    | Round (Nearest, value) ->
        ("round nearest", `Assoc (to_mecs name value))
  in
  let _type = [("type", `String _type)] in
  let parameters = [("parameters", parameters)] in
  `Assoc (_type @ [to_publicodes name pos] @ parameters)

and to_mecs name {value; chainable_mechanisms} : (string * Yojson.Basic.t) list
    =
  [ ("value mecanism", to_value_mec name value)
  ; ( "chainable mecanisms"
    , `List (List.map chainable_mechanisms ~f:(to_chain_mec name)) ) ]

let to_mapping
    ({name= name, pos; value; meta; _} : Rule_name.t Shared_ast.rule_def) :
    Yojson.Basic.t =
  let publicodes = to_publicodes name pos in
  let value = to_mecs name value in
  let name = [("name", `String (Rule_name.show name))] in
  let meta = List.filter_map meta ~f:to_meta in
  `Assoc (name @ meta @ [publicodes] @ value)

let to_json (ast : Shared_ast.resolved) : Yojson.Basic.t =
  let rules = List.map ast ~f:to_mapping in
  `Assoc [("rules", `List rules)]

let to_str (ast : Shared_ast.resolved) : string =
  Yojson.Basic.pretty_to_string @@ to_json ast
