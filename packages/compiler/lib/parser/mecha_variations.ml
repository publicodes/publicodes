open Base
open Shared.Shared_ast
open Yaml_parser
open Utils.Output.Let_syntax
open Parser_utils
open Parse_types

let parse_variation ~pos ~(parse : parse_value_fn) yaml =
  match yaml with
  | `O mapping ->
      let* _ = check_authorized_keys ~keys:["si"; "alors"] mapping in
      let* if_ =
        map_value ~pos mapping "si" ~f:(fun (if_, {pos}) -> parse ~pos if_)
      in
      let+ then_ =
        map_value ~pos mapping "alors" ~f:(fun (then_, {pos}) ->
            parse ~pos then_ )
      in
      {if_; then_}
  | _ ->
      let code, message = Err.parsing_should_be_object in
      Output.fatal_error ~pos ~kind:`Syntax ~code message

let parse_else_clause ~pos ~(parse : parse_value_fn) (yaml : yaml) =
  match yaml with
  | `O mapping ->
      (* let* _ = check_authorized_keys ~keys:["sinon"] mapping in *)
      map_value ~pos mapping "sinon" ~f:(fun (else_, {pos}) ->
          parse ~pos else_ )
  | _ ->
      let code, message = Err.parsing_should_be_object in
      Output.fatal_error ~pos ~kind:`Syntax ~code message

let parse ~pos ~(parse : parse_value_fn) (yaml : yaml) =
  match yaml with
  | `O _ | `Scalar _ ->
      let code, message = Err.parsing_should_be_array in
      Output.fatal_error ~pos ~kind:`Syntax ~code message
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
        if has_else_clause then List.drop_last_exn sequence else sequence
      in
      let* variations =
        match variations with
        | [] ->
            let code, message = Err.parsing_invalid_mechanism in
            Output.fatal_error ~code ~kind:`Syntax ~pos message
              ~hints:
                [ "Il doit y avoir au moins une variation en plus de la clause \
                   « sinon »" ]
        | _ ->
            List.map variations ~f:(parse_variation ~parse ~pos)
            |> Output.all_keep_logs
      in
      let+ else_clause =
        if has_else_clause then
          let+ else_clause = parse_else_clause ~parse ~pos last_elem in
          Some else_clause
        else Output.return None
      in
      Variations (variations, else_clause)
