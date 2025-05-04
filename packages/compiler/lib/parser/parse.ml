exception Invalid_rule_name of string

open Ast
open Core
open Yaml_parser
open Utils.Output

let parse ~filename yaml : program Output.t =
  let parse_expression ({value; _}, pos) =
    let expr = Pos.mk pos value |> Expr.Lexer.lex |> Expr.Parser.parse in
    Expr expr
  in
  let get_scalar_exn (value : yaml) =
    match value with `Scalar s -> s | _ -> failwith "Expected scalar"
  in
  let get_value value = (Pos.value value).value in
  let parse_mechanism : yaml -> Ast.rule_value = function
    | `Scalar ({value= ""; _}, _) ->
        Undefined
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
        List.fold ~f:parse_entry ~init:Undefined members
    | _ ->
        failwith "Wrong format"
  in
  let parse_meta : yaml -> Ast.rule_meta list = function
    | `Scalar _ ->
        []
    | `O m_members ->
        let parse_key (key, value) =
          match get_value key with
          | "description" ->
              Some (Description (value |> get_scalar_exn |> get_value))
          | "titre" ->
              Some (Title (value |> get_scalar_exn |> get_value))
          | _ ->
              None
        in
        List.filter_map ~f:parse_key m_members
    | _ ->
        failwith "Wrong format"
  in
  let parse_rule_name s =
    let {value; _}, pos = s in
    let expr = Pos.mk pos value |> Expr.Lexer.lex |> Expr.Parser.parse in
    match expr with
    | Ref dotted_name ->
        dotted_name
    | _ ->
        raise (Invalid_rule_name ("Invalid token: " ^ value))
  in
  match yaml with
  | `O [] ->
      fatal_error
        ~pos:(Pos.beginning_of_file filename)
        ~kind:`Syntax "Empty file"
  | `O m_members ->
      return
        (List.map m_members ~f:(fun (key, value) ->
             { name= parse_rule_name key
             ; value= parse_mechanism value
             ; meta= parse_meta value } ) )
  | _ ->
      failwith "todo"
