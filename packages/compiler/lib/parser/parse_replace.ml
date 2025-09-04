open Core
open Utils
open Output
open Parser_utils
open Shared.Shared_ast

exception Invalid_rule_name of string

let parse_references ~pos mapping =
  match find_value "references" mapping with
  | None ->
      let code, message = Err.parsing_invalid_mechanism in
      fatal_error ~pos ~kind:`Syntax ~code
        ~hints:
          [ "Il manque la règle à remplacer"
          ; "Précisez-la avec « références à: ... »" ]
        message
  | Some (`Scalar ref, _) ->
      let+ ref = parse_ref ref in
      [ref]
  | Some (`A refs, pos) ->
      parse_refs ~pos refs
  | Some (_, pos) ->
      let code, message = Err.parsing_should_not_be_object in
      fatal_error ~pos ~kind:`Syntax ~code message

let parse_refs key mapping =
  match find_value key mapping with
  | None ->
      empty
  | Some (`Scalar ref, _) ->
      let+ ref = parse_ref ref in
      [ref]
  | Some (`A refs, pos) ->
      parse_refs ~pos refs
  | Some (_, pos) ->
      let code, message = Err.parsing_should_not_be_object in
      fatal_error ~pos ~kind:`Syntax ~code message

let parse_priority mapping =
  match find_value "priority" mapping with
  | None ->
      return 0
  | Some (yaml, pos) -> (
      let* scalar = get_scalar ~pos yaml in
      let priority = scalar |> get_value |> int_of_string_opt in
      match priority with
      | Some priority ->
          return priority
      | None ->
          let code, message = Err.parsing_invalid_mechanism in
          fatal_error ~pos ~kind:`Syntax ~code ~hints:["doit être un nombre"]
            message )

let parse_replace ~pos yaml =
  match yaml with
  | `Scalar s ->
      let+ reference = parse_ref s in
      {references= [reference]; in_= []; except_in= []; priority= 0}
  | `O mapping ->
      let references = parse_references ~pos mapping in
      let in_ = parse_refs "dans" mapping in
      let except_in = parse_refs "sauf_dans" mapping in
      let priority = parse_priority mapping in
      let+ references, in_, except_in, priority =
        combine_4 references in_ except_in priority
      in
      {references; in_; except_in; priority}

let parse_replaces ~pos yaml =
  match yaml with
  | `Scalar s ->
      let+ reference = parse_ref s in
      [{references= [reference]; in_= []; except_in= []; priority= 0}]
  | `A yaml ->
      List.map ~f:(parse_replace ~pos) yaml |> all_keep_logs
  | _ ->
      let code, message = Err.parsing_should_not_be_object in
      fatal_error ~pos ~kind:`Syntax ~code message
