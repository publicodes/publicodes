open Base
open Shared.Shared_ast
open Yaml_parser
open Utils.Output.Let_syntax
open Parser_utils
open Parse_types

let parse_scale ~pos ~(parse : parse_value_fn) yaml =
  match yaml with
  | `A _ | `Scalar _ ->
      let code, err = Err.parsing_should_be_object in
      Output.fatal_error ~pos ~code ~kind:`Syntax err
  | `O mapping -> (
      let* _ = check_authorized_keys ~keys:["taux"; "plafond"] mapping in
      let rate = find_value "taux" mapping in
      let ceiling = find_value "plafond" mapping in
      match (rate, ceiling) with
      | Some (rate, {pos= pos_rate}), Some (ceiling, {pos= pos_ceiling}) ->
          let* rate = parse ~pos:pos_rate rate in
          let* ceiling = parse ~pos:pos_ceiling ceiling in
          let ceiling = ceiling in
          Output.return (Some {rate; ceiling})
      | Some _, None ->
          Output.return None
      | _ ->
          let code, message = Err.parsing_invalid_mechanism in
          Output.fatal_error ~pos ~kind:`Syntax ~code
            ~hints:["Un barème doit contenir « taux: » et « plafond: »"]
            message )

let parse_remaining_rate ~pos ~(parse : parse_value_fn) yaml =
  match yaml with
  | `A _ | `Scalar _ ->
      let code, err = Err.parsing_should_be_object in
      Output.fatal_error ~pos ~code ~kind:`Syntax err
  | `O mapping -> (
      let* _ = check_authorized_keys ~keys:["taux"; "plafond"] mapping in
      let rate = find_value "taux" mapping in
      let ceiling = find_value "plafond" mapping in
      match (rate, ceiling) with
      | Some (rate, {pos= pos_rate}), None ->
          let+ rate = parse ~pos:pos_rate rate in
          Some rate
      | Some _, Some _ ->
          Output.return None
      | _ ->
          let code, message = Err.parsing_invalid_mechanism in
          Output.fatal_error ~pos ~kind:`Syntax ~code
            ~hints:["Un barème doit contenir « taux: » et « plafond: »"]
            message )

let parse ~pos ~(parse : parse_value_fn) (yaml : yaml) =
  match yaml with
  | `A array ->
      let* scales =
        let+ scales =
          List.map array ~f:(fun yaml -> parse_scale ~pos ~parse yaml)
          |> Output.all_keep_logs
        in
        List.filter_map scales ~f:(fun this -> this)
      in
      let+ remaining_rate =
        let* remaining_rates =
          List.map array ~f:(fun yaml -> parse_remaining_rate ~pos ~parse yaml)
          |> Output.all_keep_logs
        in
        let remaining_rates =
          List.filter_map remaining_rates ~f:(fun this -> this)
        in
        if List.length remaining_rates > 1 then
          let code, message =
            Err.invalid_scale
              "Une seule tranche peut omettre « plafond: »"
          in
          Output.fatal_error ~pos ~kind:`Syntax ~code message
        else if List.length remaining_rates = 0 then Output.return None
        else Output.return (Some (List.hd_exn remaining_rates))
      in
      Scale (scales, remaining_rate)
  | `O _ | `Scalar _ ->
      let code, message = Err.parsing_should_be_array in
      Output.fatal_error ~pos ~kind:`Syntax ~code message
