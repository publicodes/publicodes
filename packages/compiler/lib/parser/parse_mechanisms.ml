open Base
open Shared.Shared_ast
open Utils
open Utils.Output.Let_syntax
open Parser_utils
open Parse_types

(* [on_root]: is the mechanism only allowed as rule root *)
type 'fn parse_mechanism = {on_root: bool; fn: 'fn parse_meca}

(* Those mechanism cannot appear more than once at the same level *)
let value_mechanisms =
  Hashtbl.of_alist_exn
    (module String)
    [ ( ( "valeur"
        , { on_root= false
          ; fn=
              (fun ~pos ~parse value ->
                let+ value = parse ~pos value in
                Value value ) } )
        : string * ('a, 'mark) value_mechanism parse_mechanism )
    ; ( "somme"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ nodes = parse_array ~pos ~parse value in
              Sum nodes ) } )
    ; ( "produit"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ nodes = parse_array ~pos ~parse value in
              Product nodes ) } )
    ; ( "moyenne"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ nodes = parse_array ~pos ~parse value in
              Average nodes ) } )
    ; ( "une de ces conditions"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ nodes = parse_array ~pos ~parse value in
              One_of nodes ) } )
    ; ( "toutes ces conditions"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ nodes = parse_array ~pos ~parse value in
              All_of nodes ) } )
    ; ( "le maximum de"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ nodes = parse_array ~pos ~parse value in
              Max_of nodes ) } )
    ; ( "le minimum de"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ nodes = parse_array ~pos ~parse value in
              Min_of nodes ) } )
    ; ("variations", {on_root= false; fn= Mecha_variations.parse})
    ; ( "est applicable"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Is_applicable value ) } )
    ; ( "est non applicable"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Is_not_applicable value ) } )
    ; ( "est défini"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Is_defined value ) } )
    ; ( "est non défini"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Is_not_defined value ) } )
    ; ("inversion numérique", {on_root= true; fn= Mecha_root_finding.parse}) ]

let chainable_mechanisms =
  Hashtbl.of_alist_exn
    (module String)
    [ ( ( "applicable si"
        , { on_root= false
          ; fn=
              (fun ~pos ~parse value ->
                let+ value = parse ~pos value in
                Applicable_if value ) } )
        : string * ('a, 'mark) chainable_mechanism parse_mechanism )
    ; ( "non applicable si"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Not_applicable_if value ) } )
    ; ( "plafond"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Ceiling value ) } )
    ; ( "plancher"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Floor value ) } )
    ; ( "abattement"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Abatement value ) } )
    ; ( "par défaut"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Default value ) } )
    ; ("contexte", {on_root= false; fn= Mecha_contexte.parse})
    ; ("type", {on_root= false; fn= Mecha_type.parse_type})
    ; ("unité", {on_root= false; fn= Mecha_type.parse_units})
    ; ( "arrondi"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Round (Nearest, value) ) } )
    ; ( "arrondi à l'inférieur"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Round (Down, value) ) } )
    ; ( "arrondi au supérieur"
      , { on_root= false
        ; fn=
            (fun ~pos ~parse value ->
              let+ value = parse ~pos value in
              Round (Up, value) ) } )
    ; ("barème", {on_root= false; fn= Mecha_scale.parse}) ]

let find_parse_mechanism ~pos ~is_root hashtbl name =
  let {on_root; fn} = Hashtbl.find_exn hashtbl name in
  if on_root && not is_root then
    let code, message = Err.parsing_invalid_mechanism in
    Output.fatal_error ~code ~pos ~kind:`Syntax
      ~hints:
        [ Stdlib.Format.asprintf
            "Ce mécanisme ne peut se trouver qu'à la racine d'une rêgle." ]
      message
  else Output.return fn

let parse_value_mechanism ~pos ~parse ~is_root mapping :
    ('a, 'mark) value_mechanism Mark.pos Output.t =
  (* 1. Check that there is at most one value mechanism *)
  let mechanism =
    List.find mapping ~f:(fun (key, _) ->
        Hashtbl.mem value_mechanisms (get_value key) )
  in
  match mechanism with
  | None ->
      Output.return (Mark.mk_pos ~pos Not_defined)
  | Some (key, value) ->
      let mechanism_name = get_value key in
      let pos = Mark.pos key in
      let* mechanism_fn =
        find_parse_mechanism ~pos ~is_root value_mechanisms mechanism_name
      in
      let+ result = mechanism_fn ~pos ~parse value in
      Mark.mk_pos ~pos result

let parse_chainable_mechanisms ~parse ~is_root mapping :
    ('a, 'mark) chainable_mechanism Mark.pos list Output.t =
  let chainable_mechanism_entries =
    List.filter mapping ~f:(fun (key, _) ->
        Hashtbl.mem chainable_mechanisms (get_value key) )
  in
  List.map
    ~f:(fun (key, value) ->
      let mechanism_name = get_value key in
      let pos = Mark.pos key in
      let* mechanism_fn =
        find_parse_mechanism ~pos ~is_root chainable_mechanisms mechanism_name
      in
      let+ value = mechanism_fn ~pos ~parse value in
      Mark.mk_pos ~pos value )
    chainable_mechanism_entries
  |> Output.all_keep_logs
