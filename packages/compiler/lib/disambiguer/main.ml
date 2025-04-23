open Core
open Parser.Ast
open Expressions.Ast
open Disambiguate_ref

let disambiguate_expr rule_names current_rule expr =
  let rec disambiguate expr =
    match expr with
    | Ref name ->
        Ref (disambiguate_ref ~rules:rule_names ~current:current_rule name)
    | BinaryOp (operator, left, right) ->
        let left = disambiguate left in
        let right = disambiguate right in
        BinaryOp (operator, left, right)
    | UnaryOp (operator, operand) ->
        let operand = disambiguate operand in
        UnaryOp (operator, operand)
    | _ -> expr
  in
  disambiguate expr

let disambiguate_value rule_names current_rule expr =
  match expr with
  | Undefined -> Undefined
  | Expr expr -> Expr (disambiguate_expr rule_names current_rule expr)

let disambiguate ast =
  let rule_names =
    RuleNameSet.of_list (List.map ast ~f:(fun rule -> rule.name))
  in
  List.map ast ~f:(fun rule ->
      {
        name = rule.name;
        value = disambiguate_value rule_names rule.name rule.value;
        meta = rule.meta;
      })
