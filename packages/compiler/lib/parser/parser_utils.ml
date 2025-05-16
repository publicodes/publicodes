open Utils.Output
open Core
open Yaml_parser

let get_value value = (Pos.value value).value

let get_scalar_exn (value : yaml) =
  match value with `Scalar s -> s | _ -> failwith "Expected scalar"

let parse_array ~pos
    ~(parse :
       ?error_if_undefined:bool -> pos:Pos.pos -> yaml -> Ast.value Output.t )
    (yaml : yaml) =
  match yaml with
  | `A seq ->
      let* parsed_nodes = seq |> List.map ~f:(parse ~pos) |> all_keep_logs in
      return parsed_nodes
  | _ ->
      let code, message = Err.parsing_should_be_array in
      fatal_error ~pos ~kind:`Syntax ~code message

let remove_double (mapping : mapping) : mapping Output.t =
  let seen_keys = ref (Set.empty (module String)) in
  let result_mapping = ref [] in
  let logs = ref [] in
  List.iter mapping ~f:(fun (key, value) ->
      let key_value = get_value key in
      let key_pos = Pos.pos key in
      if Set.mem !seen_keys key_value then
        let code, message = Err.yaml_duplicate_key in
        (* TODO: show the two keys in labels *)
        logs :=
          Log.error ~code ~pos:key_pos ~kind:`Syntax
            ~hints:["Vérifiez votre YAML pour les clés en double"]
            message
          :: !logs
      else (
        seen_keys := Set.add !seen_keys key_value ;
        result_mapping := (key, value) :: !result_mapping ) ) ;
  return ~logs:!logs (List.rev !result_mapping)
