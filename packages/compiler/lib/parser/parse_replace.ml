open Base
open Utils
open Output
open Parser_utils
open Shared.Shared_ast

exception Invalid_rule_name of string

let parse_context_references ~key mapping =
  match find_value key mapping with
  | None ->
      return []
  | Some (`Scalar ref, _) ->
      let+ ref = parse_ref ref in
      [ref]
  | Some (`A refs, pos) ->
      parse_refs ~pos refs
  | Some (`O _, pos) ->
      let code, message = Err.parsing_should_not_be_object in
      fatal_error ~pos ~kind:`Syntax ~code message

let parse_exclusive mapping =
  match find_value "exclusif" mapping with
  | None ->
      return false
  | Some (yaml, pos) -> (
      let* scalar = get_scalar ~pos yaml in
      let value = scalar |> get_value in
      match value with
      | "oui" ->
          return true
      | "non" ->
          return false
      | _ ->
          let code, message = Err.parsing_invalid_mechanism in
          fatal_error ~pos ~kind:`Syntax ~code
            ~hints:["doit valoir « oui » ou « non »"]
            message )

let no_reference_error ~pos =
  let code, message = Err.parsing_invalid_mechanism in
  fatal_error ~pos ~kind:`Syntax ~code
    ~hints:
      [ "Il manque la règle à remplacer"
      ; "Précisez-la avec « références à: ... »" ]
    message

let multiple_references_error ~pos =
  let code, message = Err.parsing_invalid_mechanism in
  fatal_error ~pos ~kind:`Syntax ~code
    ~hints:
      [ "Une seule règle peut être référencée à la fois dans un « références à »"
      ; "Utilisez plusieurs « références à: » au sein du « remplace » pour \
         remplacer plusieurs règles" ]
    message

let parse_reference ~pos mapping =
  match find_value "références à" mapping with
  | None ->
      no_reference_error ~pos
  | Some (`A _, pos) ->
      multiple_references_error ~pos
  | Some (yaml, pos) ->
      let* scalar = get_scalar ~pos yaml in
      parse_ref scalar

let parse_replace ~pos yaml =
  match yaml with
  | `Scalar s ->
      let+ reference = parse_ref s in
      {reference; only_in= []; except_in= []; exclusive= false}
  | `O mapping ->
      let* _ =
        check_authorized_keys
          ~keys:["références à"; "dans"; "sauf dans"; "exclusif"]
          mapping
      in
      let reference = parse_reference ~pos mapping in
      let only_in = parse_context_references ~key:"dans" mapping in
      let except_in = parse_context_references ~key:"sauf dans" mapping in
      let exclusive = parse_exclusive mapping in
      let+ reference, only_in, except_in, exclusive =
        combine_4 reference only_in except_in exclusive
      in
      {reference; only_in; except_in; exclusive}
  | `A _ ->
      let code, message = Err.parsing_should_not_be_array in
      fatal_error ~pos ~kind:`Syntax ~code message

let parse_make_not_applicable ~pos yaml =
  match yaml with
  | `Scalar s ->
      let+ reference = parse_ref s in
      {reference; only_in= []; except_in= []; exclusive= false}
  | `O mapping ->
      let* _ =
        check_authorized_keys
          ~keys:["références à"; "dans"; "sauf dans"]
          mapping
      in
      let reference = parse_reference ~pos mapping in
      let only_in = parse_context_references ~key:"dans" mapping in
      let except_in = parse_context_references ~key:"sauf dans" mapping in
      let+ reference, only_in, except_in =
        combine_3 reference only_in except_in
      in
      {reference; only_in; except_in; exclusive= false}
  | `A _ ->
      let code, message = Err.parsing_should_not_be_array in
      fatal_error ~pos ~kind:`Syntax ~code message
