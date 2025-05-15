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
               let* node = parse yaml in
               match Pos.value node with
               | Undefined ->
                   fatal_error ~pos ~kind:`Syntax
                     (Format.sprintf "« %s » ne peut pas avoir d'élément vide"
                        mecanism_name )
               | _ ->
                   return node )
        |> all_keep_logs
      in
      return parsed_nodes
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

let remove_double (mapping : mapping) : mapping Output.t =
  let seen_keys = ref (Set.empty (module String)) in
  let result_mapping = ref [] in
  let logs = ref [] in
  List.iter mapping ~f:(fun (key, value) ->
      let key_value = get_value key in
      let key_pos = Pos.pos key in
      if Set.mem !seen_keys key_value then
        logs :=
          Log.error ~pos:key_pos ~kind:`Syntax
            ~hint:"Vérifiez votre YAML pour les clés en double"
            (Format.sprintf
               "Clé dupliquée « %s » détectée. La première occurrence sera \
                utilisée."
               key_value )
          :: !logs
      else (
        seen_keys := Set.add !seen_keys key_value ;
        result_mapping := (key, value) :: !result_mapping ) ) ;
  return ~logs:!logs (List.rev !result_mapping)

let order_keys ~(first_keys : string list) (mapping : mapping) =
  let compare a b =
    let a_idx =
      List.findi
        ~f:(fun _ key -> String.equal (get_value (fst a)) key)
        first_keys
    in
    let b_idx =
      List.findi
        ~f:(fun _ key -> String.equal (get_value (fst b)) key)
        first_keys
    in
    match (a_idx, b_idx) with
    | Some a_idx, Some b_idx ->
        Int.compare (fst a_idx) (fst b_idx)
    | Some _, None ->
        -1
    | None, Some _ ->
        1
    | None, None ->
        0
  in
  List.sort ~compare mapping
