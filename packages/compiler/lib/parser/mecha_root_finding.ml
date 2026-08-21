open Utils.Output
open Shared.Shared_ast
open Yaml_parser
open Parser_utils
open Parse_types

let default_tolerance = 0.1

let default_min = -1000000.0

let default_max = 100000000.0

let parse ~pos ~(parse : parse_value_fn) yaml =
  let _ = parse in
  match yaml with
  | `Scalar with_ ->
      let+ with_ = parse_ref with_ in
      let with_ = [with_] in
      let tolerance = default_tolerance in
      let min = default_min in
      let max = default_max in
      Root_finding {with_; tolerance; min; max}
  | `A with_ ->
      let+ with_ = parse_refs ~pos with_ in
      let tolerance = default_tolerance in
      let min = default_min in
      let max = default_max in
      Root_finding {with_; tolerance; min; max}
  | `O mapping ->
      let* _ =
        check_authorized_keys
          ~keys:["avec"; "tolérance d'erreur"; "min"; "max"]
          mapping
      in
      let* with_ =
        match find_value "avec" mapping with
        | Some (with_, {pos= pos_with}) -> (
          match with_ with
          | `A with_ ->
              parse_refs ~pos:pos_with with_
          | _ ->
              let code, message = Err.parsing_should_be_array in
              fatal_error ~pos ~kind:`Syntax ~code message )
        | None ->
            let code, message = Err.parsing_invalid_mechanism in
            fatal_error ~pos ~kind:`Syntax ~code
              ~hints:["Une inversion numérique doit contenir « avec: »"]
              message
      in
      let* tolerance =
        match find_value "tolerance" mapping with
        | None ->
            return default_tolerance
        | Some (value, Mark.{pos}) ->
            let* scalar = get_scalar ~pos value in
            let value = get_value scalar in
            get_float ~pos value
      in
      let* min =
        match find_value "min" mapping with
        | None ->
            return default_min
        | Some (value, Mark.{pos}) ->
            let* scalar = get_scalar ~pos value in
            let value = get_value scalar in
            get_float ~pos value
      in
      let+ max =
        match find_value "max" mapping with
        | None ->
            return default_max
        | Some (value, Mark.{pos}) ->
            let* scalar = get_scalar ~pos value in
            let value = get_value scalar in
            get_float ~pos value
      in
      Root_finding {with_; tolerance; min; max}
