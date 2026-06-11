open Base
open Shared_ast

let to_mapping
    ({name= name, _; value; meta; _} : Rule_name.t Shared_ast.rule_def) :
    string * Yojson.Basic.t =
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
  let to_meta meta =
    match meta with
    | Title title ->
        Some ("titre", `String title)
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
  let to_const const : (string * Yojson.Basic.t) list =
    match const with
    | Number (number, unit) -> (
        let number = ("constante", `Float number) in
        match unit with
        | Some unit ->
            [ number
            ; ("unité", `String (Stdlib.Format.asprintf "%a" Units.pp unit)) ]
        | None ->
            [number] )
    | Bool bool ->
        [("booléan", `Bool bool)]
    | String str ->
        [("chaine de caractère", `String str)]
    | Date date -> (
      match date with
      | Day {day: int; year: int; month: int} ->
          [("date", `String (Stdlib.Format.asprintf "%d-%d-%d" year month day))]
      | Month {month: int; year: int} ->
          [("date", `String (Stdlib.Format.asprintf "%d-%d" year month))] )
  in
  let to_binop binop =
    match binop with
    | Add ->
        "addition"
    | Sub ->
        "soustraction"
    | Mul ->
        "multiplication"
    | Div ->
        "division"
    | Pow ->
        "puissance"
    | Gt ->
        "plus grand que"
    | Lt ->
        "plus petit que"
    | GtEq ->
        "plus grand ou égal à"
    | LtEq ->
        "plus petit ou égal à"
    | Eq ->
        "égal à"
    | NotEq ->
        "différent de"
    | And ->
        "et"
    | Or ->
        "ou"
    | Max ->
        "le maximum de"
    | Min ->
        "le minimum de"
  in
  let to_unop unop = match unop with Neg -> "l'opposé de" in
  let rec expr_to_mapping expr : (string * Yojson.Basic.t) list =
    match expr with
    | Const const ->
        to_const const
    | Ref ref ->
        [("reference", `String (Rule_name.show ref))]
    | Binary_op ((binop, _), (left, _), (right, _)) ->
        [ ( to_binop binop
          , `List [`Assoc (expr_to_mapping left); `Assoc (expr_to_mapping right)]
          ) ]
    | Unary_op ((unop, _), (expr, _)) ->
        [(to_unop unop, `Assoc (expr_to_mapping expr))]
  in
  let rec to_value_mec (value_meca, _) : (string * Yojson.Basic.t) list =
    match value_meca with
    | Expr (expr, _) ->
        [("expression", `Assoc (expr_to_mapping expr))]
    | Value value ->
        [("valeur", `Assoc (to_value value))]
    | Is_applicable value ->
        [("est applicable", `Assoc (to_value value))]
    | Is_not_applicable value ->
        [("n'est pas applicable", `Assoc (to_value value))]
    | Sum values ->
        [ ( "somme"
          , `List (List.map values ~f:(fun value -> `Assoc (to_value value))) )
        ]
    | Product values ->
        [ ( "produit"
          , `List (List.map values ~f:(fun value -> `Assoc (to_value value))) )
        ]
    | All_of values ->
        [ ( "all of?"
          , `List (List.map values ~f:(fun value -> `Assoc (to_value value))) )
        ]
    | Min_of values ->
        [ ( "minimum"
          , `List (List.map values ~f:(fun value -> `Assoc (to_value value))) )
        ]
    | Max_of values ->
        [ ( "maximum"
          , `List (List.map values ~f:(fun value -> `Assoc (to_value value))) )
        ]
    | One_of values ->
        [ ( "l'un de"
          , `List (List.map values ~f:(fun value -> `Assoc (to_value value))) )
        ]
    | Not_defined ->
        []
    | Variations (variations, else_) ->
        let variations : Yojson.Basic.t list =
          List.map variations ~f:(function {if_; then_} ->
              `Assoc
                [ ("si", `Assoc (to_value if_))
                ; ("alors", `Assoc (to_value then_)) ] )
        in
        let values : Yojson.Basic.t list =
          match else_ with
          | None ->
              variations
          | Some else_ ->
              variations @ [`Assoc [("sinon", `Assoc (to_value else_))]]
        in
        [("variations", `List values)]
  and to_chain_mec (chain_meca, _) : (string * Yojson.Basic.t) list =
    match chain_meca with
    | Context contexts ->
        let contexts : (string * Yojson.Basic.t) list =
          List.map contexts ~f:(function (key, _), value ->
              (Rule_name.show key, `Assoc (to_value value)) )
        in
        [("contexte", `Assoc contexts)]
    | Applicable_if value ->
        [("applicable si", `Assoc (to_value value))]
    | Not_applicable_if value ->
        [("non applicable si", `Assoc (to_value value))]
    | Type (typ, _) -> (
      match typ with
      | Literal String ->
          [("type", `String "texte")]
      | Literal Bool ->
          [("type", `String "booléen")]
      | Literal Date ->
          [("type", `String "date")]
      | Number unit -> (
        match unit with
        | Some unit ->
            [("type", `String (Stdlib.Format.asprintf "%a" Units.pp unit))]
        | None ->
            [("type", `String "nombre")] ) )
    | Default value ->
        [("par défaut", `Assoc (to_value value))]
    | Ceiling value ->
        [("plafond", `Assoc (to_value value))]
    | Floor value ->
        [("plancher", `Assoc (to_value value))]
    | Round (Up, value) ->
        [("arrondi au supérieur", `Assoc (to_value value))]
    | Round (Down, value) ->
        [("arrondi à l'inférieur", `Assoc (to_value value))]
    | Round (Nearest, value) ->
        [("arrondi", `Assoc (to_value value))]
  and to_value {value; chainable_mechanisms} : (string * Yojson.Basic.t) list =
    let id = ("id", `String (Id.hash name (Utils.Pos.pos value))) in
    let pos = to_pos (Utils.Pos.pos value) in
    let publicodes = ("_publicodes", `Assoc [id; pos]) in
    let chain_mecs = List.concat_map chainable_mechanisms ~f:to_chain_mec in
    to_value_mec value @ chain_mecs @ [publicodes]
  in
  let meta = List.filter_map meta ~f:to_meta in
  let value = to_value value in
  (Rule_name.show name, `Assoc (meta @ value))

let to_json (ast : Shared_ast.resolved) : Yojson.Basic.t =
  let rules = List.map ast ~f:to_mapping in
  `Assoc rules

let to_str (ast : Shared_ast.resolved) : string =
  Yojson.Basic.pretty_to_string @@ to_json ast
