exception Invalid_rule_name of string

open Ast
open Core
open Yaml_parser

let parse_expression value =
  let expr = value |> Expr.Lexer.lex |> Expr.Parser.parse in
  Expr expr

let get_scalar_exn value =
  match value with `Scalar s -> get_value s | _ -> failwith "Expected scalar"

let parse_mechanism : yaml -> Ast.rule_value = function
  | `Scalar ({ value = ""; _ }, _) -> Undefined
  | `Scalar ({ value; _ }, _) -> parse_expression value
  | `O members ->
      let parse_entry acc (key, value) =
        match get_value key with
        | "valeur" -> parse_expression (get_scalar_exn value)
        | _ -> acc
      in
      List.fold ~f:parse_entry ~init:Undefined members
  | _ -> failwith "Wrong format"

let parse_meta : yaml -> Ast.rule_meta list = function
  | `Scalar _ -> []
  | `O m_members ->
      let parse_key (name, value) =
        match get_value name with
        | "description" -> Some (Description (get_scalar_exn value))
        | "titre" -> Some (Title (get_scalar_exn value))
        | _ -> None
      in
      List.filter_map ~f:parse_key m_members
  | _ -> failwith "Wrong format"

let parse_rule_name s =
  let value = get_value s in
  let expr = value |> Expr.Lexer.lex |> Expr.Parser.parse in
  match expr with
  | Ref dotted_name -> dotted_name
  | _ -> raise (Invalid_rule_name ("Invalid token: " ^ value))

let parse : yaml -> (program, string) result = function
  | `O [] -> Error "Empty file"
  | `O m_members ->
      Ok
        (List.map m_members ~f:(fun (key, value) ->
             {
               name = parse_rule_name key;
               value = parse_mechanism value;
               meta = parse_meta value;
             }))
  | _ -> failwith "todo"
