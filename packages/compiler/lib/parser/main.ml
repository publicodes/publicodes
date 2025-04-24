open Core
open Ast

exception Invalid_rule_name of string

let parse_expression value =
  value |> Expr.Lexer.lex |> Expr.Parser.parse |> fun expr -> Expr expr

let get_str_exn = function
  | `Scalar Yaml.{ value; _ } -> value
  | _ -> raise (Failure "Internat error : Expected an alias or scalrar ")

let parse_mechanism : Yaml.yaml -> Ast.rule_value = function
  | `Scalar Yaml.{ value = ""; _ } -> Undefined
  | `Scalar Yaml.{ value; _ } -> parse_expression value
  | `O { m_members; _ } ->
      let parse_key acc (name, value) =
        match get_str_exn name with
        | "valeur" -> parse_expression (get_str_exn value)
        | _ -> acc
      in
      List.fold ~f:parse_key ~init:Undefined m_members
  | _ -> failwith "Wrong format"

let parse_meta : Yaml.yaml -> Ast.rule_meta list = function
  | `Scalar _ -> []
  | `O { m_members; _ } ->
      let parse_key (name, value) =
        match get_str_exn name with
        | "description" -> Some (Description (get_str_exn value))
        | "titre" -> Some (Title (get_str_exn value))
        | _ -> None
      in
      List.filter_map ~f:parse_key m_members
  | _ -> failwith "Wrong format"

let parse_rule_name : Yaml.yaml -> string list = function
  | `Scalar Yaml.{ value; _ } -> (
      let expr = value |> Expr.Lexer.lex |> Expr.Parser.parse in
      match expr with
      | Ref dotted_name -> dotted_name
      | _ -> raise (Invalid_rule_name ("Invalid token: " ^ value)))
  | _ -> raise (Invalid_argument "Expect Yaml Scalar")

let parse : Yaml.yaml -> (program, string) result = function
  | `O { m_members = []; _ } -> Error "Empty file"
  | `O { m_members; _ } ->
      Ok
        (List.map m_members ~f:(fun (key, value) ->
             {
               name = parse_rule_name key;
               value = parse_mechanism value;
               meta = parse_meta value;
             }))
  | _ -> failwith "todo"

(*

(yaml * yaml) list

type scalar = {
  anchor : string option;
  tag : string option;
  value : string;
  plain_implicit : bool;
  quoted_implicit : bool;
  style : scalar_style;
}

type yaml =
  [ `Scalar of scalar | `Alias of string | `A of sequence | `O of mapping ]

and sequence = {
  s_anchor : string option;
  s_tag : string option;
  s_implicit : bool;
  s_members : yaml list;
}

and mapping = {
  m_anchor : string option;
  m_tag : string option;
  m_implicit : bool;
  m_members : (yaml * yaml) list;
}


*)
