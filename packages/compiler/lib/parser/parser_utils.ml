open Utils.Output
open Core
open Shared.Shared_ast
open Yaml_parser

let get_value value = (Pos.value value).value

let get_scalar_exn (value : yaml) =
  match value with `Scalar s -> s | _ -> failwith "Expected scalar"

let parse_array ~pos ~parse ~mecanism_name (yaml : yaml) =
  match yaml with
  | `A seq ->
      let* parsed_nodes =
        seq
        |> List.map ~f:(fun yaml ->
               let* node_value = parse yaml in
               match node_value with
               | Undefined pos ->
                   fatal_error ~pos ~kind:`Syntax
                     (Format.sprintf "« %s » ne peut pas avoir d'élément vide"
                        mecanism_name )
               | _ ->
                   return node_value )
        |> from_list
      in
      return (Pos.mk ~pos parsed_nodes)
  | _ ->
      fatal_error ~pos ~kind:`Syntax
        (Format.sprintf "« %s » doit contenir un tableau de valeurs"
           mecanism_name )

let only_one_of ~keys ~error_msg mapping : unit Output.t =
  let keys =
    List.filter_map mapping ~f:(fun (key, _) ->
        let key_value = get_value key in
        if List.mem ~equal:String.equal keys key_value then
          Some (key_value, Pos.pos key)
        else None )
  in
  match keys with
  | [] | [_] ->
      return ()
  | (key, _) :: keys ->
      let logs =
        List.map
          ~f:(fun (_, pos) ->
            Log.error ~kind:`Syntax ~pos
              ~hint:"Il y a peut-être une erreur d'indentation"
              (Format.sprintf error_msg key) )
          keys
      in
      (None, logs)
