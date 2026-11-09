open Base
open Shared.Shared_ast
open Yaml_parser
open Utils.Output.Let_syntax
open Parser_utils
open Parse_types

let parse_scale ~pos ~(parse : parse_value_fn) mapping =
  let* _ = check_authorized_keys ~keys:["taux"; "plafond"] mapping in
  let rate = find_value "taux" mapping in
  let ceiling = find_value "plafond" mapping in
  match (rate, ceiling) with
  | Some (rate, {pos= pos_rate}), Some (ceiling, {pos= pos_ceiling}) ->
      let* rate = parse ~pos:pos_rate rate in
      let* ceiling = parse ~pos:pos_ceiling ceiling in
      let ceiling = ceiling in
      Output.return {rate; ceiling}
  | _ ->
      let code, message = Err.parsing_invalid_mechanism in
      Output.fatal_error ~pos ~kind:`Syntax ~code
        ~hints:["Un barème doit contenir « taux: » et « plafond: »"]
        message

let parse_remaining_rate ~pos ~(parse : parse_value_fn) mapping =
  let* _ = check_authorized_keys ~keys:["taux"; "plafond"] mapping in
  let rate = find_value "taux" mapping in
  match rate with
  | Some (rate, {pos= pos_rate}) ->
      let* rate = parse ~pos:pos_rate rate in
      Output.return rate
  | _ ->
      let code, message = Err.parsing_invalid_mechanism in
      Output.fatal_error ~pos ~kind:`Syntax ~code
        ~hints:["Ce barème doit contenir « taux: »"]
        message

let parse_entries ~pos ~(parse : parse_value_fn) array =
  let* scales, remaining_rate =
    let* entries, last =
      match List.rev array with
      | fst :: rems ->
          Output.return (List.rev rems, fst)
      | [] ->
          let code, message =
            Err.invalid_scale "Il faut au moins une tranche"
          in
          Output.fatal_error ~pos ~kind:`Syntax ~code message
    in
    let* entries =
      List.map entries ~f:(get_object ~pos) |> Output.all_keep_logs
    in
    let+ last = get_object ~pos last in
    match find_value "plafond" last with
    | Some _ ->
        (entries @ [last], None)
    | None ->
        (entries, Some last)
  in
  let* scales =
    List.map scales ~f:(fun yaml -> parse_scale ~pos ~parse yaml)
    |> Output.all_keep_logs
  in
  let+ remaining_rate =
    Output.map_opt remaining_rate ~f:(parse_remaining_rate ~pos ~parse)
  in
  Scale (scales, remaining_rate)

let parse ~pos ~(parse : parse_value_fn) (yaml : yaml) =
  let* array = get_array ~pos yaml in
  parse_entries ~pos ~parse array
