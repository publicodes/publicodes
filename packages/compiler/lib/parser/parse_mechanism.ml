open Core
open Shared.Shared_ast
open Yaml_parser
open Output
open Parser_utils
open Expr

(* Those mecanism cannot appear more than once at the same level *)
let value_mecanism =
  ["somme"; "produit"; "une de ces conditions"; "toutes ces conditions"]

let rec parse_value (yaml : yaml) =
  match yaml with
  | `Scalar ({value= ""; _}, pos) ->
      return (Undefined pos)
  | `Scalar ({value; _}, pos) ->
      let* expr = parse_expression ~pos value in
      return (Expr expr)
  | `O mapping ->
      parse_mechanism mapping
  | `A _ ->
      raise (Invalid_argument "should not array")

and parse_mechanism mapping =
  let parse_entry acc (key, value) =
    let* acc = acc in
    let pos = Pos.pos key in
    match get_value key with
    | "valeur" ->
        parse_value value
    | "somme" ->
        parse_sum ~pos value
    | "produit" ->
        parse_product ~pos value
    | "une de ces conditions" ->
        parse_any_of ~pos value
    | "toutes ces conditions" ->
        parse_all_of ~pos value
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
  List.fold ~f:parse_entry ~init:(return (Undefined Pos.dummy)) mapping

and parse_sum ~pos (yaml : yaml) =
  let+ nodes =
    parse_array ~pos ~mecanism_name:"somme" ~parse:parse_value yaml
  in
  Sum nodes

and parse_product ~pos (yaml : yaml) =
  let+ nodes =
    parse_array ~pos ~mecanism_name:"produit" ~parse:parse_value yaml
  in
  Product nodes

and parse_all_of ~pos (yaml : yaml) =
  let+ nodes =
    parse_array ~pos ~mecanism_name:"toutes ces conditions" ~parse:parse_value
      yaml
  in
  AllOf nodes

and parse_any_of ~pos (yaml : yaml) =
  let+ nodes =
    parse_array ~pos ~mecanism_name:"une de ces conditions" ~parse:parse_value
      yaml
  in
  AnyOf nodes
