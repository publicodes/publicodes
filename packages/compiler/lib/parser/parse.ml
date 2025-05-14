open Core
open Utils.Output
open Shared.Shared_ast
open Yaml_parser

exception Invalid_rule_name of string

let parse_expression ({value; _}, pos) =
  let expr = Pos.mk ~pos value |> Expr.Lexer.lex |> Expr.Parser.parse in
  Expr expr

let get_scalar_exn (value : yaml) =
  match value with `Scalar s -> s | _ -> failwith "Expected scalar"

let get_value value = (Pos.value value).value

let parse_mechanism ~pos (yaml : yaml) =
  match yaml with
  | `Scalar ({value= ""; _}, _) ->
      Undefined pos
  | `Scalar value ->
      parse_expression value
  | `O members ->
      let parse_entry acc (key, value) =
        match get_value key with
        | "valeur" ->
            parse_expression (get_scalar_exn value)
        | _ ->
            acc
      in
      List.fold ~f:parse_entry ~init:(Undefined pos) members
  | `A _ ->
      raise (Invalid_argument "should not array")

let parse_meta (yaml : yaml) =
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
  let expr = Pos.mk ~pos value |> Expr.Lexer.lex |> Expr.Parser.parse in
  match expr with
  | Ref rule_name, _ ->
      return (Pos.mk ~pos (Shared.Rule_name.create_exn rule_name))
  | _ ->
      fatal_error ~pos ~kind:`Syntax "Le nom de la règle est invalide"

let parse_rule = function
  | name, `A _ ->
      fatal_error ~pos:(Pos.pos name) ~kind:`Syntax
        "Une règle ne peut pas être un tableau"
  | name, raw_rule ->
      let* name = parse_rule_name name in
      let value = parse_mechanism ~pos:(Pos.pos name) raw_rule in
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
