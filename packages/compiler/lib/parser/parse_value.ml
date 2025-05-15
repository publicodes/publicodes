open Core
open Shared.Shared_ast
open Yaml_parser
open Output
open Parser_utils
open Expr

(* Those mecanism cannot appear more than once at the same level *)
let value_mecanism =
  ["somme"; "produit"; "une de ces conditions"; "toutes ces conditions"]

let chainable_mecanism =
  [ "contexte"
  ; (* "ref manquante"; *)
    "applicable"
  ; "non applicable"
  ; (* "arrondi";
  "unité";
  "simplifierUnité"; *)
    "plancher"
  ; "plafond"
  ; (* "parDéfaut"; *)
    "situation" (* "résoudreRéférenceCirculaire";
	"abattement" *) ]

let rec parse ~pos (yaml : yaml) : Ast.value Output.t =
  match yaml with
  | `Scalar ({value= ""; _}, pos) ->
      return (Undefined, pos)
  | `Scalar ({value; _}, pos) ->
      let* expr = parse_expression ~pos value in
      return (Expr expr, pos)
  | `O mapping ->
      let* node = parse_mechanism mapping in
      return (node, pos)
  | `A _ ->
      let logs =
        [ Log.error ~pos ~kind:`Syntax "Une valeur ne peut pas être un tableau"
            ~hint:
              "Peut-être avez-vous oublié d'ajouter le nom du mécanisme (par \
               exemple « somme : »)" ]
      in
      (Some (Undefined, pos), logs)

and parse_mechanism mapping : 'a naked_value Output.t =
  let* mapping =
    remove_double mapping >>| order_keys ~first_keys:chainable_mecanism
  in
  let parse_entry acc (key, value) =
    let* acc = acc in
    let pos = Pos.pos key in
    let parse = parse ~pos:(Pos.pos key) in
    let mecanism_name = get_value key in
    match mecanism_name with
    | "valeur" ->
        value |> parse >>| Pos.value
    | "somme" ->
        let+ nodes = parse_array ~pos ~mecanism_name ~parse value in
        Sum nodes
    | "produit" ->
        let+ nodes = parse_array ~pos ~mecanism_name ~parse value in
        Product nodes
    | "une de ces conditions" ->
        let+ nodes = parse_array ~pos ~mecanism_name ~parse value in
        One_of nodes
    | "toutes ces conditions" ->
        let+ nodes = parse_array ~pos ~mecanism_name ~parse value in
        All_of nodes
    | "applicable si" ->
        let+ node = parse value in
        Applicable_if (node, Pos.mk ~pos acc)
    | "non applicable si" ->
        let+ node = parse value in
        Not_applicable_if (node, Pos.mk ~pos acc)
    | "plafond" ->
        let+ node = parse value in
        Ceiling (node, Pos.mk ~pos acc)
    | "plancher" ->
        let+ node = parse value in
        Floor (node, Pos.mk ~pos acc)
    | "variations" ->
        parse_variations value
    | _ ->
        return acc
  in
  (* 1. Check that there is at most one value mechanism *)
  let* _ =
    only_one_of ~keys:value_mecanism
      ~error_msg:
        "Une valeur a déjà été définie à ce niveau (avec le mécanisme %s)."
      mapping
  in
  List.fold ~f:parse_entry ~init:(return Undefined) mapping

and parse_variations (_ : yaml) = return Undefined
