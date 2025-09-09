open Core
open Utils.Output
open Shared.Shared_ast
open Yaml_parser
open Parser_utils

exception Invalid_rule_name of string

let parse_meta mapping =
  let parse_key (key, value) =
    let scalar_value () = get_scalar ~pos:(Pos.pos key) value in
    match get_value key with
    | "description" ->
        let* value = scalar_value () in
        return (Description (get_value value))
    | "titre" ->
        let* value = scalar_value () in
        return (Title (get_value value))
    | "public" ->
        (* @TODO : put a warning if default_to_public is true, and do not add it *)
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

let rec parse_rule ~default_to_public ?(current_rule_name = []) (name, yaml) =
  let* name, pos = parse_ref name in
  let name = current_rule_name @ name in
  let* value = Parse_value.parse_value ~error_if_undefined:false ~pos yaml in
  let* meta =
    match yaml with `O mapping -> parse_meta mapping | _ -> return []
  in
  let meta = if default_to_public then Public :: meta else meta in
  let+ with_ =
    match yaml with
    | `O mapping ->
        parse_with ~default_to_public ~current_rule_name:name mapping
    | _ ->
        return []
  in
  {name= Pos.mk ~pos (Shared.Rule_name.create_exn name); value; meta} :: with_

and parse_with ~default_to_public ?(current_rule_name = []) mapping =
  let rules =
    List.find_map mapping ~f:(fun (key, value) ->
        if String.equal (get_value key) "avec" then
          Some (Pos.mk ~pos:(Pos.pos key) value)
        else None )
  in
  match rules with
  | None ->
      return []
  | Some (rules, pos) ->
      parse_rules ~default_to_public ~pos ~current_rule_name rules

and parse_rules ~default_to_public ~pos ?(current_rule_name = []) yaml =
  match yaml with
  | `O [] ->
      let code, message =
        if List.is_empty current_rule_name then Err.yaml_empty_file
        else Err.parsing_should_be_object
      in
      fatal_error ~code ~pos ~kind:`Syntax message
  | `O mapping ->
      let+ rules =
        List.map ~f:(parse_rule ~default_to_public ~current_rule_name) mapping
        |> all_keep_logs
      in
      List.concat rules
  | _ ->
      let code, message = Err.parsing_should_be_object in
      fatal_error ~pos ~code ~kind:`Syntax message

let parse ~filename ?(default_to_public = false) (yaml : yaml) : Ast.t Output.t
    =
  parse_rules ~default_to_public ~pos:(Pos.beginning_of_file filename) yaml
