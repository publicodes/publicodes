open Base
open Shared.Shared_ast

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
  let id_str = Shared.Id.hash name pos |> Shared.Id.to_string in
  let id = ("id", `String id_str) in
  let pos = to_pos pos in
  [id; pos]

let to_binop binop =
  Shared.Shared_ast.sexp_of_binary_op binop
  |> Sexp.to_string |> String.lowercase

let to_unop unop =
  Shared.Shared_ast.sexp_of_unary_op unop |> Sexp.to_string |> String.lowercase

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
  let kind, parameters =
    match const with
    | Number (number, unit) ->
        let unit =
          match unit with
          | Some unit ->
              [ ( "unit"
                , `String (Stdlib.Format.asprintf "%a" Shared.Units.pp unit) )
              ]
          | None ->
              []
        in
        ("number", ("value", `Float number) :: unit)
    | Bool bool ->
        ("bool", [("value", `Bool bool)])
    | String str ->
        ("string", [("value", `String str)])
    | Date date ->
        let date =
          match date with
          | Day {day: int; year: int; month: int} ->
              `String (Stdlib.Format.asprintf "%d-%d-%d" year month day)
          | Month {month: int; year: int} ->
              `String (Stdlib.Format.asprintf "%d-%d" year month)
        in
        ("date", [("value", date)])
  in
  let kind = ("kind", `String kind) in
  `Assoc (kind :: parameters)

let rec expr_to_mapping get_type rule_name (expr_value, expr_pos) :
    Yojson.Basic.t =
  let expr_to_mapping = expr_to_mapping get_type rule_name in
  let kind, parameters =
    match expr_value with
    | Const const ->
        ("constant", to_const const)
    | Ref ref ->
        ("ref", `String (Shared.Rule_name.show ref))
    | Binary_op ((binop, _), left, right) ->
        ( to_binop binop
        , `Assoc
            [("left", expr_to_mapping left); ("right", expr_to_mapping right)]
        )
    | Unary_op ((unop, _), expr) ->
        (to_unop unop, expr_to_mapping expr)
  in
  let kind = [("kind", `String kind)] in
  let parameters = [("parameters", parameters)] in
  let compiler_metadata = to_compiler_metadata rule_name expr_pos in
  let typ = get_type ~rule:rule_name ~pos:expr_pos in
  `Assoc (kind @ typ @ parameters @ compiler_metadata)

let rec to_value_mec get_type rule_name (value_meca, pos) : Yojson.Basic.t =
  let to_mechanism = to_mechanism get_type rule_name in
  let kind, parameters =
    match value_meca with
    | Expr expr ->
        ("expr", Some (expr_to_mapping get_type rule_name expr))
    | Value value ->
        ("value", Some (`Assoc (to_mechanism value)))
    | Is_applicable value ->
        ("is_applicable", Some (`Assoc (to_mechanism value)))
    | Is_not_applicable value ->
        ("is_not_applicable", Some (`Assoc (to_mechanism value)))
    | Sum values ->
        ( "sum"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism value) )) ) )
    | Product values ->
        ( "product"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism value) )) ) )
    | All_of values ->
        ( "all_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism value) )) ) )
    | Min_of values ->
        ( "min_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism value) )) ) )
    | Max_of values ->
        ( "max_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism value) )) ) )
    | One_of values ->
        ( "one_of"
        , Some
            (`List
               (List.map values ~f:(function value ->
                   `Assoc (to_mechanism value) )) ) )
    | Not_defined ->
        ("not_defined", None)
    | Variations (variations, else_) ->
        let variations : Yojson.Basic.t list =
          List.map variations ~f:(function {if_; then_} ->
              `Assoc
                [ ("if", `Assoc (to_mechanism if_))
                ; ("then", `Assoc (to_mechanism then_)) ] )
        in
        let value =
          match else_ with
          | None ->
              [("conditions", `List variations)]
          | Some else_ ->
              [ ("conditions", `List variations)
              ; ("else", `Assoc (to_mechanism else_)) ]
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
  let typ = get_type ~rule:rule_name ~pos in
  let kind = [("kind", `String kind)] in
  `Assoc (kind @ typ @ to_compiler_metadata rule_name pos @ parameters)

and to_chained_mechanism get_type name (chained_mecha, pos) : Yojson.Basic.t =
  let to_mechanism = to_mechanism get_type name in
  let (kind : string), (parameters : Yojson.Basic.t) =
    match chained_mecha with
    | Context contexts ->
        let contexts : (string * Yojson.Basic.t) list =
          List.map contexts ~f:(function (key, _pos), value ->
              (Shared.Rule_name.show key, `Assoc (to_mechanism value)) )
        in
        ("context", `Assoc contexts)
    | Applicable_if value ->
        ("applicable_if", `Assoc (to_mechanism value))
    | Not_applicable_if value ->
        ("not_applicable_if", `Assoc (to_mechanism value))
    | Type (typ, _) ->
        ( "type_def"
        , `Assoc
            [ ( "value"
              , match typ with
                | Literal String ->
                    `String "text"
                | Literal Bool ->
                    `String "boolean"
                | Literal Date ->
                    `String "date"
                | Number unit ->
                    let unit =
                      match unit with
                      | Some unit ->
                          Stdlib.Format.asprintf "%a" Shared.Units.pp unit
                      | None ->
                          "number"
                    in
                    `String unit ) ] )
    | Default value ->
        ("default", `Assoc (to_mechanism value))
    | Ceiling value ->
        ("ceiling", `Assoc (to_mechanism value))
    | Floor value ->
        ("floor", `Assoc (to_mechanism value))
    | Round (Up, value) ->
        ("round_up", `Assoc (to_mechanism value))
    | Round (Down, value) ->
        ("round_down", `Assoc (to_mechanism value))
    | Round (Nearest, value) ->
        ("round_nearest", `Assoc (to_mechanism value))
  in
  let kind = [("kind", `String kind)] in
  let parameters = [("parameters", parameters)] in
  let typ = get_type ~rule:name ~pos in
  `Assoc (kind @ typ @ to_compiler_metadata name pos @ parameters)

and to_mechanism get_type name {value; chainable_mechanisms} :
    (string * Yojson.Basic.t) list =
  [ ("value_mechanism", to_value_mec get_type name value)
  ; ( "chained_mechanisms"
    , `List
        (List.map chainable_mechanisms ~f:(to_chained_mechanism get_type name))
    ) ]

let to_json_entry {name= name, pos; value; meta; _} get_type =
  let compiler_metadata = to_compiler_metadata name pos in
  let value = to_mechanism get_type name value in
  let meta = List.filter_map meta ~f:to_meta in
  let typ = get_type ~rule:name ~pos in
  ( Shared.Rule_name.to_string name
  , `Assoc (typ @ compiler_metadata @ meta @ value) )

let to_str ast (typed_ast : Typed_tree.t) =
  let get_type ~rule ~pos =
    let typ = Typed_tree.get_type ~rule ~pos typed_ast in
    match Typed_tree.Typ.to_concrete typ with
    | Some (Number None) ->
        [("type", `String "number")]
    | Some (Number (Some unit)) ->
        [ ("type", `String "number")
        ; ("unit", `String (Stdlib.Format.asprintf "%a" Shared.Units.pp unit))
        ]
    | Some (Literal String) ->
        [("type", `String "text")]
    | Some (Literal Bool) ->
        [("type", `String "boolean")]
    | Some (Literal Date) ->
        [("type", `String "date")]
    | _ ->
        (* FIXME: should not happen *)
        [("type", `String "unknown")]
  in
  let json_entries =
    `Assoc (List.map ast ~f:(fun rule_def -> to_json_entry rule_def get_type))
  in
  Yojson.Basic.pretty_to_string json_entries
