open Core
open Utils.Output
open Shared.Shared_ast
open Yaml_parser
open Parser_utils
open Parse_mechanism

exception Invalid_rule_name of string

let parse_meta yaml =
  match yaml with
  | `Scalar _ ->
      return []
  | `O m_members ->
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
      List.map ~f:parse_key m_members |> from_list
  | `A _ ->
      raise (Invalid_argument "should not array")

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
  match yaml with
  | `A _ ->
      let pos = Pos.pos name in
      let logs =
        [ Log.error ~pos ~kind:`Syntax "Une règle ne peut pas être un tableau"
            ~hint:
              "Peut-être avez-vous oublié d'ajouter le nom du mécanisme (par \
               exemple « somme : »)" ]
      in
      return ~logs {name; value= Undefined pos; meta= []}
  | raw_rule ->
      let* value = parse_value raw_rule in
      let* meta = parse_meta raw_rule in
      return {name; value; meta}

let parse ~filename (yaml : yaml) : Ast.t Output.t =
  match yaml with
  | `O [] ->
      fatal_error
        ~pos:(Pos.beginning_of_file filename)
        ~kind:`Syntax "Empty file"
  | `O m_members ->
      List.map m_members ~f:parse_rule |> from_list
  | _ ->
      failwith "todo"
