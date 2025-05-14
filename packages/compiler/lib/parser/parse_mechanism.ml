open Core
open Shared.Shared_ast
open Yaml_parser
open Output
open Expr

let get_value value = (Pos.value value).value

let get_scalar_exn (value : yaml) =
  match value with `Scalar s -> s | _ -> failwith "Expected scalar"

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
        parse_somme ~pos value
    | _ ->
        return acc
  in
  List.fold ~f:parse_entry ~init:(return (Undefined Pos.dummy)) mapping

and parse_somme ~pos (yaml : yaml) =
  match yaml with
  | `A seq ->
      let* parsed_nodes =
        seq
        |> List.map ~f:(fun node ->
               let* node_value = parse_value node in
               match node_value with
               | Undefined pos ->
                   fatal_error ~pos ~kind:`Syntax
                     "Une somme ne peut pas avoir d'élément vide"
               | _ ->
                   return node_value )
        |> from_list
      in
      return (Sum (Pos.mk ~pos parsed_nodes))
  | _ ->
      fatal_error ~pos ~kind:`Syntax "Une somme contenir un tableau de valeurs"
