open Utils.Output
open Shared.Shared_ast
open Yaml_parser
open Utils.Output.Let_syntax
open Parser_utils
open Parse_types

let def_tolerance = 0.1

let def_min = -1000000.0

let def_max = 100000000.0

let parse ~pos ~(parse : parse_value_fn) yaml =
  let _ = parse in
  match yaml with
  | `Scalar with_ ->
      let+ with_ = parse_ref with_ in
      let with_ = [with_] in
      let tolerance = def_tolerance in
      let min = def_min in
      let max = def_max in
      Root_finding {with_; tolerance; min; max}
  | `A with_ ->
      let+ with_ = parse_refs ~pos with_ in
      let tolerance = def_tolerance in
      let min = def_min in
      let max = def_max in
      Root_finding {with_; tolerance; min; max}
  | `O mapping ->
      let* _ =
        check_authorized_keys
          ~keys:["avec"; "tolérance d'erreur"; "min"; "max"]
          mapping
      in
      let* with_ =
        map_value ~pos mapping "avec" ~f:(function
          | `A with_, {pos= pos_with} ->
              parse_refs ~pos:pos_with with_
          | _ ->
              let code, message = Err.parsing_should_be_array in
              fatal_error ~pos ~kind:`Syntax ~code message )
      in
      let map_float default =
        let parse_float = function
          | value, Mark.{pos} ->
              let* scalar = get_scalar ~pos value in
              let value = get_value scalar in
              get_float ~pos value
        in
        map_value ~pos ~default ~f:parse_float mapping
      in
      let* tolerance = map_float def_tolerance "tolerance" in
      let* min = map_float def_min "min" in
      let+ max = map_float def_max "max" in
      Root_finding {with_; tolerance; min; max}
