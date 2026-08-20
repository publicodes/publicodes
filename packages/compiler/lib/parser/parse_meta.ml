open Base
open Utils
open Output.Let_syntax
open Shared.Shared_ast
open Yaml_parser
open Parser_utils

let reserved_meta =
  [ "description"
  ; "titre"
  ; "public"
  ; "meta"
  ; "note"
  ; "applicabilité étendue à l'espace de nom" ]

let parse_custom_meta ~pos yaml =
  match yaml with
  | `A _ | `Scalar _ ->
      let code, err = Err.parsing_should_be_object in
      Output.fatal_error ~pos ~code ~kind:`Syntax err
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
              let pos = Mark.pos k in
              let key = Yaml_parser.get_value k in
              Mark.mk_pos ~pos key )
            reserved_keys
        in
        Output.fatal_error ~pos ~code ~kind:`Syntax ~labels:reserved_keys_label
          ~hints:
            [ ( match reserved_keys_label with
              | [_] ->
                  "Cette méta doit être déplacée à la racine de la règle"
              | _ ->
                  "Ces métas doivent être déplacées à la racine de la règle" )
            ]
          err
      else
        let meta = Custom_meta (Yaml_parser.to_json (`O mapping)) in
        Output.return (Mark.mk_pos ~pos meta)

let parse mapping =
  let parse_key (key, value) =
    let pos = Mark.pos key in
    let ret value = Output.return (Mark.mk_pos ~pos value) in
    match get_value key with
    | "description" ->
        let* value = get_scalar ~pos value in
        ret (Description (get_value value))
    | "titre" ->
        let* value = get_scalar ~pos value in
        ret (Title (get_value value))
    | "note" ->
        let* value = get_scalar ~pos value in
        ret (Note (get_value value))
    | "meta" ->
        parse_custom_meta ~pos:(Mark.pos key) value
    | "public" ->
        let* _ = Parser_utils.check_boolean ~pos value in
        ret Public
    | "applicabilité étendue à l'espace de nom" ->
        let* _ = Parser_utils.check_boolean ~pos value in
        ret Applicable_on_namespace
    | _ ->
        Output.empty
  in
  List.map ~f:parse_key mapping |> Output.all_keep_logs
