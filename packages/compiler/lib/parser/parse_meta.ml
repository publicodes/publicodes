open Base
open Utils.Output
open Shared.Shared_ast
open Yaml_parser
open Parser_utils

let reserved_meta = ["description"; "titre"; "public"; "meta"; "note"]

let parse_custom_meta ~pos yaml =
  match yaml with
  | `A _ | `Scalar _ ->
      let code, err = Err.parsing_should_be_object in
      fatal_error ~pos ~code ~kind:`Syntax err
  | `O mapping ->
      let reserved_keys =
        List.filter_map
          ~f:(fun (k, _) ->
            let key = Yaml_parser.get_value k in
            if List.exists ~f:(String.equal key) reserved_meta then Some k
            else None )
          mapping
      in
      if not (List.is_empty reserved_keys) then
        let code, err = Err.invalid_meta in
        (* let open Stdlib.Format in *)
        let reserved_keys_label =
          List.map
            ~f:(fun k ->
              let pos = Pos.pos k in
              let key = Yaml_parser.get_value k in
              Pos.mk ~pos key )
            reserved_keys
        in
        fatal_error ~pos ~code ~kind:`Syntax ~labels:reserved_keys_label
          ~hints:
            [ ( match reserved_keys_label with
              | [_] ->
                  "Cette méta doit être déplacée à la racine de la règle"
              | _ ->
                  "Ces métas doivent être déplacées à la racine de la règle" )
            ]
          err
      else return (Custom_meta (Yaml_parser.to_json (`O mapping)))

let parse mapping =
  let parse_key (key, value) =
    let scalar_value () = get_scalar ~pos:(Pos.pos key) value in
    match get_value key with
    | "description" ->
        let* value = scalar_value () in
        return (Description (get_value value))
    | "titre" ->
        let* value = scalar_value () in
        return (Title (get_value value))
    | "note" ->
        let* value = scalar_value () in
        return (Note (get_value value))
    | "meta" ->
        parse_custom_meta ~pos:(Pos.pos key) value
    | "public" ->
        let* value = scalar_value () in
        let pos = Pos.pos value in
        let value = get_value value in
        if not (String.equal value "oui" || String.equal value "") then
          let code, message = Err.invalid_value in
          fatal_error ~pos ~code ~kind:`Syntax message
            ~labels:[Pos.mk ~pos "doit valoir `oui` ou être vide"]
            ~hints:
              [ Printf.sprintf "Remplacez `%s` par `oui` ou supprimez la clée"
                  value ]
        else return Public
    | _ ->
        empty
  in
  List.map ~f:parse_key mapping |> all_keep_logs
