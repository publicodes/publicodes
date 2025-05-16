open Core
open Shared.Shared_ast
open Yaml_parser
open Utils
open Utils.Output
open Parser_utils
open Expr

(* Those mecanism cannot appear more than once at the same level *)
type 'a parse_fn =
     pos:Pos.pos
  -> parse:
       (?error_if_undefined:bool -> pos:Pos.pos -> yaml -> Ast.value Output.t)
  -> yaml
  -> 'a Output.t

let value_mecanisms =
  Hashtbl.of_alist_exn
    (module String)
    [ ( ( "valeur"
        , fun ~pos ~parse value ->
            let+ value = parse ~pos value in
            Value value )
        : string * 'a value_mechanism parse_fn )
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
      (* ; ( "variations"
      , fun value _pos _mecanism_name _parse -> parse_variations value )
     *)
    ]

let chainable_mecanisms =
  Hashtbl.of_alist_exn
    (module String)
    [ ( ( "applicable si"
        , fun ~pos ~parse value ->
            let+ value = parse ~pos value in
            Applicable_if value )
        : string * 'a chainable_mechanism parse_fn )
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
          Floor value ) ]

let rec parse ?(error_if_undefined = true) ~pos (yaml : yaml) :
    Ast.value Output.t =
  match yaml with
  | `Scalar ({value= ""; _}, pos) ->
      let logs =
        if error_if_undefined then
          [Log.error ~pos ~kind:`Syntax "Cette valeur est vide"]
        else []
      in
      return ~logs {value= Pos.mk ~pos Undefined; chainable_mechanisms= []}
  | `Scalar ({value; _}, pos) ->
      let* expr = parse_expression ~pos value in
      return {value= Pos.mk ~pos (Expr expr); chainable_mechanisms= []}
  | `O mapping ->
      let* mapping = remove_double mapping in
      let* value = parse_value_mechanism ~pos mapping in
      let* chainable_mechanisms = parse_chainable_mecanisms ~pos mapping in
      let logs =
        if error_if_undefined then
          [ Log.error ~pos ~kind:`Syntax
              "Aucune valeur n'est définie à cet endroit"
              ~hint:
                "Ajoutez un mecanisme de valeur, comme par exemple : « valeur \
                 », « somme » ou « une de ces conditions »." ]
        else []
      in
      return ~logs {value; chainable_mechanisms}
  | `A _ ->
      let logs =
        [ Log.error ~pos ~kind:`Syntax "Une valeur ne peut pas être un tableau"
            ~hint:
              "Peut-être avez-vous oublié d'ajouter le nom du mécanisme (par \
               exemple « somme : »)" ]
      in
      return ~logs {value= Pos.mk ~pos Undefined; chainable_mechanisms= []}

and parse_value_mechanism ~pos mapping : 'a value_mechanism Pos.t Output.t =
  (* 1. Check that there is at most one value mechanism *)
  let mecanism =
    List.find mapping ~f:(fun (key, _) ->
        Hashtbl.mem value_mecanisms (get_value key) )
  in
  match mecanism with
  | None ->
      return (Pos.mk ~pos Undefined)
  | Some (key, value) ->
      let mecanism_name = get_value key in
      let mecanism_fn = Hashtbl.find_exn value_mecanisms mecanism_name in
      let+ result = mecanism_fn ~pos ~parse value in
      Pos.mk ~pos result

and parse_chainable_mecanisms ~pos mapping :
    'a chainable_mechanism Pos.t list Output.t =
  let chainable_mecanism_entries =
    List.filter mapping ~f:(fun (key, _) ->
        Hashtbl.mem chainable_mecanisms (get_value key) )
  in
  List.map
    ~f:(fun (key, value) ->
      let mecanism_name = get_value key in
      let mecanism_fn = Hashtbl.find_exn chainable_mecanisms mecanism_name in
      let+ value = mecanism_fn ~pos ~parse value in
      Pos.mk ~pos value )
    chainable_mecanism_entries
  |> all_keep_logs
