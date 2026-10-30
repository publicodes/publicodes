open Base
open Shared
open Utils

let to_point (point : Pos.Point.t) =
  [ ("index", `Int point.index)
  ; ("line", `Int point.line)
  ; ("column", `Int point.column) ]

let to_pos (pos : Pos.t) : string * Yojson.Basic.t =
  let file_path = File.to_intern pos.file in
  ( "position"
  , `Assoc
      [ ("file", `String file_path)
      ; ("start", `Assoc (to_point pos.start_pos))
      ; ("end", `Assoc (to_point pos.end_pos)) ] )

let to_compiler_metadata name pos : (string * Yojson.Basic.t) list =
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
  | Shared_ast.Title title ->
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

(** TODO: handle enums and literal values *)
let to_type (typ : Typ.t) =
  match typ with
  | Literal (LNumber (_, None), _) | TNumber None ->
      [("type", `String "number")]
  | Literal (LNumber (_, Some unit), _) | TNumber (Some unit) ->
      [ ("type", `String "number")
      ; ("unit", `String (Stdlib.Format.asprintf "%a" Shared.Units.pp unit)) ]
  | Literal (LString _, _) | TString ->
      [("type", `String "text")]
  | Literal (LBool _, _) | TBool ->
      [("type", `String "boolean")]
  | Literal (LDate _, _) | TDate ->
      [("type", `String "date")]
  | Literal (LSymbol _, _) ->
      [("type", `String "symbol")]
  | TEnum _ ->
      [("type", `String "enum")]

let to_type_opt (typ : Typ.t option) =
  match typ with
  | Some typ ->
      to_type typ
  | None ->
      [("type", `String "unknown")]

let to_const const : Yojson.Basic.t =
  let kind, parameters =
    match const with
    | Shared_ast.Number (number, unit) ->
        let unit =
          match unit with
          | Some unit ->
              [ ( "unit"
                , `String (Stdlib.Format.asprintf "%a" Shared.Units.pp unit) )
              ]
          | None ->
              []
        in
        ("const_number", ("value", `Float number) :: unit)
    | Bool bool ->
        ("const_boolean", [("value", `Bool bool)])
    | String str ->
        ("const_text", [("value", `String str)])
    | Symbol str ->
        ("const_symbol", [("value", `String str)])
    | Date date ->
        let date =
          match date with
          | Day {day: int; year: int; month: int} ->
              `String (Stdlib.Format.asprintf "%d-%02d-%02d" year month day)
          | Month {month: int; year: int} ->
              `String (Stdlib.Format.asprintf "%d-%02d" year month)
        in
        ("const_date", [("value", date)])
  in
  let kind = ("kind", `String kind) in
  `Assoc (kind :: parameters)

type graphs =
  { replacement_graph: Replacement_graph.t
  ; make_not_applicable_graph: Replacement_graph.t }

let to_names (marks : Rule_name.t Mark.pos list) : Yojson.Basic.t =
  `List
    (List.map marks ~f:(fun m ->
         `String (Shared.Rule_name.show (Mark.remove m)) ) )

(** A « remplace » / « rend non applicable » clause as written on the rule. *)
let to_replace (r : Replacement_graph.replace) : Yojson.Basic.t =
  let Shared_ast.{reference; only_in; except_in; exclusive} = r in
  `Assoc
    [ ("reference", `String (Shared.Rule_name.show (Mark.remove reference)))
    ; ("only_in", to_names only_in)
    ; ("except_in", to_names except_in)
    ; ("exclusive", `Bool exclusive)
    ; ("position", snd (to_pos (Mark.pos reference))) ]

(** A replacing rule as a `ref` node: same id/position/type as the reference
    it replaces (the eval tree shares the node's meta, so the trace value at
    that id is the replacement's), with its own replacements below it. *)
let rec to_inlined_ref ~compiler_metadata ~typ
    (r : Replacement_graph.inlined_ref) : Yojson.Basic.t =
  let children field l =
    match List.map l ~f:(to_inlined_ref ~compiler_metadata ~typ) with
    | [] ->
        []
    | l ->
        [(field, `List l)]
  in
  `Assoc
    ( [("kind", `String "ref")]
    @ typ
    @ [("parameters", `String (Shared.Rule_name.show r.rule))]
    @ children "replaced_by" r.replaced_by
    @ children "made_not_applicable_by" r.made_not_applicable_by
    @ compiler_metadata )

(** The replacements inlined at a reference site, resolved once by the compiler,
    emitted as `ref` nodes attached to the site's own `ref` node. *)
let ref_replacement_fields ~from ~compiler_metadata ~typ (graphs : graphs)
    (ref : Rule_name.t) : (string * Yojson.Basic.t) list =
  let inlined =
    Replacement_graph.resolve ~from ~replacement_graph:graphs.replacement_graph
      ~make_not_applicable_graph:graphs.make_not_applicable_graph ~rule:ref
  in
  let children field l =
    match List.map l ~f:(to_inlined_ref ~compiler_metadata ~typ) with
    | [] ->
        []
    | l ->
        [(field, `List l)]
  in
  children "replaced_by" inlined.replaced_by
  @ children "made_not_applicable_by" inlined.made_not_applicable_by

let rec expr_to_mapping rule_name (graphs : graphs)
    ((expr_value, expr_mark) : Shared_ast.typed_expr) : Yojson.Basic.t =
  let expr_to_mapping = expr_to_mapping rule_name graphs in
  let compiler_metadata = to_compiler_metadata rule_name expr_mark.pos in
  let typ = match expr_mark.typ with Some typ -> to_type typ | None -> [] in
  let kind, parameters, replacement_fields =
    match expr_value with
    | Shared_ast.Const const ->
        ("constant", to_const const, [])
    | Ref ref ->
        ( "ref"
        , `String (Shared.Rule_name.show ref)
        , ref_replacement_fields ~from:rule_name ~compiler_metadata ~typ graphs
            ref )
    | Binary_op ((binop, _), left, right) ->
        ( to_binop binop
        , `Assoc
            [("left", expr_to_mapping left); ("right", expr_to_mapping right)]
        , [] )
    | Unary_op ((unop, _), expr) ->
        (to_unop unop, expr_to_mapping expr, [])
  in
  let kind = [("kind", `String kind)] in
  let parameters = [("parameters", parameters)] in
  `Assoc (kind @ typ @ parameters @ replacement_fields @ compiler_metadata)

let rec to_value_mechanism rule_name (graphs : graphs)
    (value, Shared_ast.{typ; pos}) : Yojson.Basic.t =
  let to_mechanism = to_mechanism rule_name graphs in
  let kind, parameters =
    match value with
    | Shared_ast.Expr expr ->
        ("expr", Some (expr_to_mapping rule_name graphs expr))
    | Value value ->
        ("value", Some (`Assoc (to_mechanism value)))
    | Is_defined value ->
        ("is_defined", Some (`Assoc (to_mechanism value)))
    | Is_not_defined value ->
        ("is_not_defined", Some (`Assoc (to_mechanism value)))
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
    | Average values ->
        ( "average"
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
  let kind = [("kind", `String kind)] in
  `Assoc
    (kind @ to_type_opt typ @ to_compiler_metadata rule_name pos @ parameters)

and to_chained_mechanism name (graphs : graphs)
    ((mecha, mecha_mark) :
      Shared_ast.typed_chainable_mechanism * Shared_ast.typed_mark ) :
    Yojson.Basic.t =
  let to_mechanism = to_mechanism name graphs in
  let (kind : string), (parameters : Yojson.Basic.t) =
    match mecha with
    | Shared_ast.Context contexts ->
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
        ("type_def", `Assoc (to_type typ))
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
  `Assoc
    ( kind @ to_type_opt mecha_mark.typ
    @ to_compiler_metadata name mecha_mark.pos
    @ parameters )

and to_mechanism name (graphs : graphs) ({value; chainable_mechanisms}, _) :
    (string * Yojson.Basic.t) list =
  [ ("value_mechanism", to_value_mechanism name graphs value)
  ; ( "chained_mechanisms"
    , `List
        (List.map chainable_mechanisms ~f:(to_chained_mechanism name graphs)) )
  ]

let to_json_entry (graphs : graphs)
    ({name; value; meta; replace; make_not_applicable} :
      Shared_ast.typed_rule_def ) =
  let name, Mark.{pos} = name in
  (* NOTE: we miss the type information in the rule_def, for now we need to
     retrieve it from the value *)
  let typ_opt = (Mark.get value).typ in
  let compiler_metadata = to_compiler_metadata name pos in
  let value = to_mechanism name graphs value in
  let meta = List.filter_map meta ~f:to_meta in
  (* The authored clauses only: the replacements active on the rule itself are
     not emitted until root evaluation applies them. *)
  let replacements =
    ( if List.is_empty replace then []
      else [("replaces", `List (List.map replace ~f:to_replace))] )
    @
    if List.is_empty make_not_applicable then []
    else
      [ ( "makes_not_applicable"
        , `List (List.map make_not_applicable ~f:to_replace) ) ]
  in
  ( Shared.Rule_name.to_string name
  , `Assoc
      (to_type_opt typ_opt @ compiler_metadata @ meta @ replacements @ value) )

let to_str ~replacement_graph ~make_not_applicable_graph
    (typed_ast : Shared_ast.typed) =
  let graphs = {replacement_graph; make_not_applicable_graph} in
  let json_entries = `Assoc (List.map typed_ast ~f:(to_json_entry graphs)) in
  Yojson.Basic.pretty_to_string json_entries
