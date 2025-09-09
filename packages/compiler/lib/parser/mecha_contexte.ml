open Core
open Shared.Shared_ast
open Yaml_parser
open Utils.Output
open Parser_utils
open Parse_types

let parse ~pos ~(parse : parse_value_fn) (yaml : yaml) =
  match yaml with
  | `A _ | `Scalar _ ->
      let code, message = Err.parsing_should_be_object in
      fatal_error ~pos ~kind:`Syntax ~code message
  | `O mapping ->
      let+ context =
        List.map mapping ~f:(fun (key, value) ->
            let* rule_name = parse_ref key in
            let* value = parse ~pos value in
            return (rule_name, value) )
        |> all_keep_logs
      in
      Context context
