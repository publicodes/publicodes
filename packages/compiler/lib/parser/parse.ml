open Core
open Utils.Output
open Shared.Shared_ast
open Yaml_parser
open Parser_utils

exception Invalid_rule_name of string

let parse_meta mapping =
  let parse_key (key, value) =
    match get_value key with
    | "description" ->
        return (Description (value |> get_scalar_exn |> get_value))
    | "titre" ->
        return (Title (value |> get_scalar_exn |> get_value))
    | "public" ->
        let value = get_scalar_exn value in
        let pos = Pos.pos value in
        let value = get_value value in
        if not (String.equal value "oui" || String.equal value "") then
          fatal_error ~pos ~kind:`Syntax "La valeur doit être 'oui'"
        else return Public
    | _ ->
        (None, [])
  in
  List.map ~f:parse_key mapping |> all_keep_logs

let parse_rule_name s =
  let {value; _}, pos = s in
  let expr = Expr.parse_expression ~pos value in
  match expr with
  | Some (Ref rule_name, _), _ ->
      return (Pos.mk ~pos (Shared.Rule_name.create_exn rule_name))
  | _ ->
      fatal_error ~pos ~kind:`Syntax "Le nom de la règle est invalide"

let parse_rule (name, yaml) =
  let* name = parse_rule_name name in
  let pos = Pos.pos name in
  let* value = Parse_value.parse ~error_if_undefined:false ~pos yaml in
  let* meta =
    match yaml with `O mapping -> parse_meta mapping | _ -> return []
  in
  return {name; value; meta}

let parse ~filename (yaml : yaml) : Ast.t Output.t =
  match yaml with
  | `O [] ->
      fatal_error
        ~pos:(Pos.beginning_of_file filename)
        ~kind:`Syntax "Empty file"
  | `O m_members ->
      List.map m_members ~f:parse_rule |> all_keep_logs
  | _ ->
      failwith "todo"
