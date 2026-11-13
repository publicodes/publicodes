open Base
open Utils
open Output.Let_syntax
open Parser_utils
open Shared.Shared_ast

exception Invalid_rule_name of string

let parse_context_references = function
  | `Scalar ref, _ ->
      let+ ref = parse_ref ref in
      [ref]
  | `A refs, Mark.{pos} ->
      parse_refs ~pos refs
  | `O _, Mark.{pos} ->
      let code, message = Err.parsing_should_not_be_object in
      Output.fatal_error ~pos ~kind:`Syntax ~code message

let parse_exclusive (value, Mark.{pos}) =
  let* scalar = get_scalar ~pos value in
  match get_value scalar with
  | "oui" ->
      Output.return true
  | "non" ->
      Output.return false
  | _ ->
      let code, message = Err.parsing_invalid_mechanism in
      Output.fatal_error ~pos ~kind:`Syntax ~code
        ~hints:["doit valoir « oui » ou « non »"]
        message

let multiple_references_error ~pos =
  let code, message = Err.parsing_invalid_mechanism in
  Output.fatal_error ~pos ~kind:`Syntax ~code
    ~hints:
      [ "Une seule règle peut être référencée à la fois dans un « références à »"
      ; "Utilisez plusieurs « références à: » au sein du « remplace » pour \
         remplacer plusieurs règles" ]
    message

let parse_reference = function
  | `A _, Mark.{pos} ->
      multiple_references_error ~pos
  | yaml, Mark.{pos} ->
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
      let reference =
        map_value ~pos mapping "références à" ~f:parse_reference
      in
      let only_in =
        map_value ~pos ~default:[] mapping "dans" ~f:parse_context_references
      in
      let except_in =
        map_value ~pos ~default:[] mapping "sauf dans"
          ~f:parse_context_references
      in
      let exclusive =
        map_value ~pos ~default:false mapping "exclusif" ~f:parse_exclusive
      in
      let+ reference, only_in, except_in, exclusive =
        Output.combine_4 reference only_in except_in exclusive
      in
      {reference; only_in; except_in; exclusive}
  | `A _ ->
      let code, message = Err.parsing_should_not_be_array in
      Output.fatal_error ~pos ~kind:`Syntax ~code message

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
      let reference =
        map_value ~pos mapping "références à" ~f:parse_reference
      in
      let only_in =
        map_value ~pos ~default:[] mapping "dans" ~f:parse_context_references
      in
      let except_in =
        map_value ~pos ~default:[] mapping "sauf dans"
          ~f:parse_context_references
      in
      let+ reference, only_in, except_in =
        Output.combine_3 reference only_in except_in
      in
      {reference; only_in; except_in; exclusive= false}
  | `A _ ->
      let code, message = Err.parsing_should_not_be_array in
      Output.fatal_error ~pos ~kind:`Syntax ~code message
