open Base
open Utils
open Output
open Parser_utils
open Shared.Shared_ast

exception Invalid_rule_name of string

let parse_references ~key ?(if_key_not_found = return []) mapping =
  match find_value key mapping with
  | None ->
      if_key_not_found
  | Some (`Scalar ref, _) ->
      let+ ref = parse_ref ref in
      [ref]
  | Some (`A refs, pos) ->
      parse_refs ~pos refs
  | Some (`O _, pos) ->
      let code, message = Err.parsing_should_not_be_object in
      fatal_error ~pos ~kind:`Syntax ~code message

let parse_priority mapping =
  match find_value "priorité" mapping with
  | None ->
      return 0
  | Some (yaml, pos) -> (
      let* scalar = get_scalar ~pos yaml in
      let priority = scalar |> get_value |> Stdlib.int_of_string_opt in
      match priority with
      | Some priority ->
          return priority
      | None ->
          let code, message = Err.parsing_invalid_mechanism in
          fatal_error ~pos ~kind:`Syntax ~code ~hints:["doit être un nombre"]
            message )

let no_reference_error ~pos =
  let code, message = Err.parsing_invalid_mechanism in
  fatal_error ~pos ~kind:`Syntax ~code
    ~hints:
      [ "Il manque la règle à remplacer"
      ; "Précisez-la avec « références à: ... »" ]
    message

let parse_replace ~pos yaml =
  match yaml with
  | `Scalar s ->
      let+ reference = parse_ref s in
      {references= [reference]; only_in= []; except_in= []; priority= 0}
  | `O mapping ->
      let* _ =
        check_authorized_keys
          ~keys:["références à"; "dans"; "sauf dans"; "priorité"]
          mapping
      in
      let references =
        parse_references ~key:"références à"
          ~if_key_not_found:(no_reference_error ~pos) mapping
      in
      let only_in = parse_references ~key:"dans" mapping in
      let except_in = parse_references ~key:"sauf dans" mapping in
      let priority = parse_priority mapping in
      let+ references, only_in, except_in, priority =
        combine_4 references only_in except_in priority
      in
      {references; only_in; except_in; priority}
  | `A _ ->
      let code, message = Err.parsing_should_not_be_array in
      fatal_error ~pos ~kind:`Syntax ~code message

let parse_make_not_applicable ~pos yaml =
  match yaml with
  | `Scalar s ->
      let+ reference = parse_ref s in
      {references= [reference]; only_in= []; except_in= []; priority= 0}
  | `O mapping ->
      let* _ =
        check_authorized_keys
          ~keys:["références à"; "dans"; "sauf dans"]
          mapping
      in
      let references =
        parse_references ~key:"références à"
          ~if_key_not_found:(no_reference_error ~pos) mapping
      in
      let only_in = parse_references ~key:"dans" mapping in
      let except_in = parse_references ~key:"sauf dans" mapping in
      let+ references, only_in, except_in =
        combine_3 references only_in except_in
      in
      {references; only_in; except_in; priority= 0}
  | `A _ ->
      let code, message = Err.parsing_should_not_be_array in
      fatal_error ~pos ~kind:`Syntax ~code message
