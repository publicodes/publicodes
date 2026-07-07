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

let to_compiler_metadata name pos =
  let id_str = Id.hash name pos |> Id.to_string in
  let id = ("id", `String id_str) in
  let pos = to_pos pos in
  [id; pos]

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
  let type_, parameters =
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
  let type_ = ("type", `String type_) in
  let parameters = ("parameters", parameters) in
  `Assoc [type_; parameters]

let rec expr_to_mapping rule_name (expr_value, expr_pos) : Yojson.Basic.t =
  let expr_to_mapping = expr_to_mapping rule_name in
  let kind, parameters =
    match expr_value with
    | Const const ->
        ("constant", to_const const)
    | Ref ref ->
        ("ref", `String (Rule_name.show ref))
    | Binary_op ((binop, _), left, right) ->
        ( to_binop binop
        , `Assoc
            [("left", expr_to_mapping left); ("right", expr_to_mapping right)]
        )
    | Unary_op ((unop, _), expr) ->
        (to_unop unop, expr_to_mapping expr)
  in
  let kind = ("kind", `String kind) in
  let parameters = ("parameters", parameters) in
  let compiler_metadata = to_compiler_metadata rule_name expr_pos in
  `Assoc (kind :: parameters :: compiler_metadata)

let rec to_value_mec rule_name (value_meca, pos) : Yojson.Basic.t =
  let kind, parameters =
    match value_meca with
    | Expr expr ->
        ("expr", Some (expr_to_mapping rule_name expr))
    | Value value ->
        ("value", Some (`Assoc (to_mechanism rule_name value)))
    | Is_applicable value ->
        ("is_applicable", Some (`Assoc (to_mechanism rule_name value)))
    | Is_not_applicable value ->
        ("is_not_applicable", Some (`Assoc (to_mechanism rule_name value)))
    | Sum values ->
        ( "sum"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism rule_name value) )) ) )
    | Product values ->
        ( "product"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism rule_name value) )) ) )
    | All_of values ->
        ( "all_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism rule_name value) )) ) )
    | Min_of values ->
        ( "min_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism rule_name value) )) ) )
    | Max_of values ->
        ( "max_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism rule_name value) )) ) )
    | One_of values ->
        ( "one_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism rule_name value) )) ) )
    | Not_defined ->
        ("not_defined", None)
    | Variations (variations, else_) ->
        let variations : Yojson.Basic.t list =
          List.map variations ~f:(function {if_; then_} ->
              `Assoc
                [ ("if", `Assoc (to_mechanism rule_name if_))
                ; ("then", `Assoc (to_mechanism rule_name then_)) ] )
        in
        let value =
          match else_ with
          | None ->
              [("conditions", `List variations)]
          | Some else_ ->
              [ ("conditions", `List variations)
              ; ("else", `Assoc (to_mechanism rule_name else_)) ]
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
  let kind = [("kind", `String kind)] in
  `Assoc (kind @ to_compiler_metadata rule_name pos @ parameters)

and to_chained_mechanism name (chained_mecha, pos) : Yojson.Basic.t =
  let (kind : string), (parameters : Yojson.Basic.t) =
    match chained_mecha with
    | Context contexts ->
        let contexts : (string * Yojson.Basic.t) list =
          List.map contexts ~f:(function (key, _pos), value ->
              (Rule_name.show key, `Assoc (to_mechanism name value)) )
        in
        ("context", `Assoc contexts)
    | Applicable_if value ->
        ("applicable_if", `Assoc (to_mechanism name value))
    | Not_applicable_if value ->
        ("not_applicable_if", `Assoc (to_mechanism name value))
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
                "number"
          in
          ("type", `Assoc [("type", `String unit)]) )
    | Default value ->
        ("default", `Assoc (to_mechanism name value))
    | Ceiling value ->
        ("ceiling", `Assoc (to_mechanism name value))
    | Floor value ->
        ("floor", `Assoc (to_mechanism name value))
    | Round (Up, value) ->
        ("round_up", `Assoc (to_mechanism name value))
    | Round (Down, value) ->
        ("round_down", `Assoc (to_mechanism name value))
    | Round (Nearest, value) ->
        ("round_nearest", `Assoc (to_mechanism name value))
  in
  let kind = [("kind", `String kind)] in
  let parameters = [("parameters", parameters)] in
  `Assoc (kind @ to_compiler_metadata name pos @ parameters)

and to_mechanism name {value; chainable_mechanisms} :
    (string * Yojson.Basic.t) list =
  [ ("value_mechanism", to_value_mec name value)
  ; ( "chained_mechanisms"
    , `List (List.map chainable_mechanisms ~f:(to_chained_mechanism name)) ) ]

let to_json_entry
    ({name= name, pos; value; meta; _} : Rule_name.t Shared_ast.rule_def) :
    string * Yojson.Basic.t =
  let publicodes = to_compiler_metadata name pos in
  let value = to_mechanism name value in
  let meta = List.filter_map meta ~f:to_meta in
  (Rule_name.to_string name, `Assoc (publicodes @ meta @ value))

let to_str (ast : Shared_ast.resolved) : string =
  let json_entries = `Assoc (List.map ast ~f:to_json_entry) in
  Yojson.Basic.pretty_to_string json_entries
