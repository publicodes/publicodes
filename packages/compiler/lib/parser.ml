open Core
open Ast

let get_key_exn = function
  | `Alias str -> str
  | `Scalar Yaml.{ value; _ } -> value
  | _ -> raise (Failure "Internat error : Expected an alias or scalrar ")

let parse_mechanism : Yaml.yaml -> Ast.rule_value = function
  | `Scalar Yaml.{ value; _ } ->
      (* TODO: handle errors from parsing *)
      Expr (value |> Expressions.Lexer.lex |> Expressions.Parser.parse)
  | _ -> Undefined

let parse : Yaml.yaml -> (program, string) result = function
  | `O { m_members = []; _ } -> Error "Empty file"
  | `O { m_members; _ } ->
      Ok
        (List.map m_members ~f:(fun (key, value) ->
             { name = get_key_exn key; value = parse_mechanism value }))
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
