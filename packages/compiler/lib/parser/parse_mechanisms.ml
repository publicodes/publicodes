open Core
open Shared.Shared_ast
open Utils
open Utils.Output
open Parser_utils
open Parse_types

(* Those mechanism cannot appear more than once at the same level *)
let value_mechanisms =
  Hashtbl.of_alist_exn
    (module String)
    [ ( ( "valeur"
        , fun ~pos ~parse value ->
            let+ value = parse ~pos value in
            Value value )
        : string * 'a value_mechanism parse_meca )
    ; ( "somme"
      , fun ~pos ~parse value ->
          let+ nodes = parse_array ~pos ~parse value in
          Sum nodes )
    ; ( "produit"
      , fun ~pos ~parse value ->
          let+ nodes = parse_array ~pos ~parse value in
          Product nodes )
    ; ( "une de ces conditions"
      , fun ~pos ~parse value ->
          let+ nodes = parse_array ~pos ~parse value in
          One_of nodes )
    ; ( "toutes ces conditions"
      , fun ~pos ~parse value ->
          let+ nodes = parse_array ~pos ~parse value in
          All_of nodes )
    ; ( "le maximum de"
      , fun ~pos ~parse value ->
          let+ nodes = parse_array ~pos ~parse value in
          Max_of nodes )
    ; ( "le minimum de"
      , fun ~pos ~parse value ->
          let+ nodes = parse_array ~pos ~parse value in
          Min_of nodes )
    ; ("variations", Mecha_variations.parse)
    ; ( "est applicable"
      , fun ~pos ~parse value ->
          let+ value = parse ~pos value in
          Is_applicable value )
    ; ( "est non applicable"
      , fun ~pos ~parse value ->
          let+ value = parse ~pos value in
          Is_not_applicable value ) ]

let chainable_mechanisms =
  Hashtbl.of_alist_exn
    (module String)
    [ ( ( "applicable si"
        , fun ~pos ~parse value ->
            let+ value = parse ~pos value in
            Applicable_if value )
        : string * 'a chainable_mechanism parse_meca )
    ; ( "non applicable si"
      , fun ~pos ~parse value ->
          let+ value = parse ~pos value in
          Not_applicable_if value )
    ; ( "plafond"
      , fun ~pos ~parse value ->
          let+ value = parse ~pos value in
          Ceiling value )
    ; ( "plancher"
      , fun ~pos ~parse value ->
          let+ value = parse ~pos value in
          Floor value )
    ; ( "par défaut"
      , fun ~pos ~parse value ->
          let+ value = parse ~pos value in
          Default value )
    ; ("contexte", Mecha_contexte.parse)
    ; ("type", Mecha_type.parse_type)
    ; ("unité", Mecha_type.parse_units)
    ; ( "arrondi"
      , fun ~pos ~parse value ->
          let+ value = parse ~pos value in
          Round (Nearest, value) )
    ; ( "arrondi à l'inférieur"
      , fun ~pos ~parse value ->
          let+ value = parse ~pos value in
          Round (Down, value) )
    ; ( "arrondi au supérieur"
      , fun ~pos ~parse value ->
          let+ value = parse ~pos value in
          Round (Up, value) ) ]

let parse_value_mechanism ~pos ~parse mapping :
    'a value_mechanism Pos.t Output.t =
  (* 1. Check that there is at most one value mechanism *)
  let mechanism =
    List.find mapping ~f:(fun (key, _) ->
        Hashtbl.mem value_mechanisms (get_value key) )
  in
  match mechanism with
  | None ->
      return (Pos.mk ~pos Undefined)
  | Some (key, value) ->
      let mechanism_name = get_value key in
      let mechanism_fn = Hashtbl.find_exn value_mechanisms mechanism_name in
      let+ result = mechanism_fn ~pos:(Pos.pos key) ~parse value in
      Pos.mk ~pos result

let parse_chainable_mechanisms ~parse mapping :
    'a chainable_mechanism Pos.t list Output.t =
  let chainable_mechanism_entries =
    List.filter mapping ~f:(fun (key, _) ->
        Hashtbl.mem chainable_mechanisms (get_value key) )
  in
  List.map
    ~f:(fun (key, value) ->
      let mechanism_name = get_value key in
      let mechanism_fn = Hashtbl.find_exn chainable_mechanisms mechanism_name in
      let pos = Pos.pos key in
      let+ value = mechanism_fn ~pos ~parse value in
      Pos.mk ~pos value )
    chainable_mechanism_entries
  |> all_keep_logs
