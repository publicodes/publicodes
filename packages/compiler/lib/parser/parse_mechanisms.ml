open Base
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
        , ( false
          , fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Value value ) )
        : string * (bool * ('a, 'mark) value_mechanism parse_meca) )
    ; ( "somme"
      , ( false
        , fun ~pos ~parse value ->
            let+ nodes = parse_array ~pos ~parse value in
            Sum nodes ) )
    ; ( "produit"
      , ( false
        , fun ~pos ~parse value ->
            let+ nodes = parse_array ~pos ~parse value in
            Product nodes ) )
    ; ( "moyenne"
      , ( false
        , fun ~pos ~parse value ->
            let+ nodes = parse_array ~pos ~parse value in
            Average nodes ) )
    ; ( "une de ces conditions"
      , ( false
        , fun ~pos ~parse value ->
            let+ nodes = parse_array ~pos ~parse value in
            One_of nodes ) )
    ; ( "toutes ces conditions"
      , ( false
        , fun ~pos ~parse value ->
            let+ nodes = parse_array ~pos ~parse value in
            All_of nodes ) )
    ; ( "le maximum de"
      , ( false
        , fun ~pos ~parse value ->
            let+ nodes = parse_array ~pos ~parse value in
            Max_of nodes ) )
    ; ( "le minimum de"
      , ( false
        , fun ~pos ~parse value ->
            let+ nodes = parse_array ~pos ~parse value in
            Min_of nodes ) )
    ; ("variations", (false, Mecha_variations.parse))
    ; ( "est applicable"
      , ( false
        , fun ~pos ~parse value ->
            let+ value = parse ~pos value in
            Is_applicable value ) )
    ; ( "est non applicable"
      , ( false
        , fun ~pos ~parse value ->
            let+ value = parse ~pos value in
            Is_not_applicable value ) )
    ; ("inversion numérique", (true, Mecha_root_finding.parse)) ]

let chainable_mechanisms =
  Hashtbl.of_alist_exn
    (module String)
    [ ( ( "applicable si"
        , fun ~pos ~parse value ->
            let+ value = parse ~pos value in
            Applicable_if value )
        : string * ('a, 'mark) chainable_mechanism parse_meca )
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

let parse_value_mechanism ~pos ~parse ~is_root mapping :
    ('a, 'mark) value_mechanism Mark.pos Output.t =
  (* 1. Check that there is at most one value mechanism *)
  let mechanism =
    List.find mapping ~f:(fun (key, _) ->
        Hashtbl.mem value_mechanisms (get_value key) )
  in
  match mechanism with
  | None ->
      return (Mark.mk_pos ~pos Not_defined)
  | Some (key, value) ->
      let mechanism_name = get_value key in
      let on_root, mechanism_fn =
        Hashtbl.find_exn value_mechanisms mechanism_name
      in
      let pos = Mark.pos key in
      let* _ =
        if on_root && not is_root then
          let code, message = Err.parsing_invalid_mechanism in
          fatal_error ~code ~pos ~kind:`Syntax
            ~hints:
              [ Stdlib.Format.asprintf
                  "Une inversion numérique ne peut se trouver qu'à la racine \
                   d'une rêgle." ]
            message
        else return ()
      in
      let+ result = mechanism_fn ~pos ~parse value in
      Mark.mk_pos ~pos result

let parse_chainable_mechanisms ~parse mapping :
    ('a, 'mark) chainable_mechanism Mark.pos list Output.t =
  let chainable_mechanism_entries =
    List.filter mapping ~f:(fun (key, _) ->
        Hashtbl.mem chainable_mechanisms (get_value key) )
  in
  List.map
    ~f:(fun (key, value) ->
      let mechanism_name = get_value key in
      let mechanism_fn = Hashtbl.find_exn chainable_mechanisms mechanism_name in
      let pos = Mark.pos key in
      let+ value = mechanism_fn ~pos ~parse value in
      Mark.mk_pos ~pos value )
    chainable_mechanism_entries
  |> all_keep_logs
