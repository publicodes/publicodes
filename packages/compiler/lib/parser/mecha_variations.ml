open Core
open Shared.Shared_ast
open Yaml_parser
open Utils.Output
open Parser_utils
open Parse_types

let parse_variation ~pos ~(parse : parse_value_fn) yaml =
  match yaml with
  | `O mapping -> (
      let* _ = check_authorized_keys ~keys:["si"; "alors"] mapping in
      let if_ = find_value "si" mapping in
      let then_ = find_value "alors" mapping in
      match (if_, then_) with
      | Some (if_, pos_if), Some (then_, pos_then) ->
          let* if_ = parse ~pos:pos_if if_ in
          let+ then_ = parse ~pos:pos_then then_ in
          {if_; then_}
      | _ ->
          let code, message = Err.parsing_invalid_mechanism in
          fatal_error ~pos ~kind:`Syntax ~code
            ~hints:["Une variation doit contenir « si: » et « alors: »"]
            message )
  | _ ->
      let code, message = Err.parsing_should_be_object in
      fatal_error ~pos ~kind:`Syntax ~code message

let parse_else_clause ~(parse : parse_value_fn) (yaml : yaml) =
  match yaml with
  | `O mapping -> (
      (* let* _ = check_authorized_keys ~keys:["sinon"] mapping in *)
      let else_ = find_value "sinon" mapping in
      match else_ with
      | Some (else_, pos_else) ->
          let+ else_ = parse ~pos:pos_else else_ in
          else_
      | None ->
          failwith "Internal error: missing 'sinon' key" )
  | _ ->
      failwith "Internal error: not an object"

let parse ~pos ~(parse : parse_value_fn) (yaml : yaml) =
  match yaml with
  | `O _ | `Scalar _ ->
      let code, message = Err.parsing_should_be_array in
      fatal_error ~pos ~kind:`Syntax ~code message
  | `A sequence ->
      let last_elem = List.last_exn sequence in
      let has_else_clause =
        match last_elem with
        | `O [(key, _)] ->
            String.equal (get_value key) "sinon"
        | _ ->
            false
      in
      let variations =
        if has_else_clause then List.slice sequence 0 (-1) else sequence
      in
      let* variations =
        match variations with
        | [] ->
            let code, message = Err.parsing_invalid_mechanism in
            fatal_error ~code ~kind:`Syntax ~pos message
              ~hints:
                [ "Il doit y avoir au moins une variation en plus de la clause \
                   « sinon »" ]
        | _ ->
            List.map variations ~f:(parse_variation ~parse ~pos)
            |> all_keep_logs
      in
      let+ else_clause =
        if has_else_clause then
          let+ else_clause = parse_else_clause ~parse last_elem in
          Some else_clause
        else return None
      in
      Variations (variations, else_clause)
