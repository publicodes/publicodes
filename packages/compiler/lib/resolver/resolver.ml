open Core
open Parser.Ast
open Utils
open Utils.Output
open Expr.Ast
open Common

let disambiguate_expr rule_names current_rule expr =
  let rec resolve expr =
    match expr with
    | Ref name ->
        Ref (Reference.resolve ~rules:rule_names ~current:current_rule name)
    | BinaryOp (operator, left, right) ->
        let left = resolve left in
        let right = resolve right in
        BinaryOp (operator, left, right)
    | UnaryOp (operator, operand) ->
        let operand = resolve operand in
        UnaryOp (operator, operand)
    | _ ->
        expr
  in
  resolve expr

let resolve_value names current_rule expr =
  match expr with
  | Undefined ->
      Undefined
  | Expr expr ->
      Expr (disambiguate_expr names current_rule expr)

let check_orphan_rules rule_names ast =
  let warn_if_orphan {name= name, pos; _} =
    let parent = Dotted_name.parent name in
    match parent with
    | None ->
        None
    | Some parent ->
        if not (Set.mem rule_names parent) then
          Some
            (Log.error ~pos ~kind:`Syntax
               ~hint:
                 (Format.asprintf {|Créez une règle vide pour le parent:

%a:
|}
                    Dotted_name.pp parent )
               "Le parent de la règle n'existe pas" )
        else None
  in
  List.filter_map ast ~f:warn_if_orphan

let resolve ast =
  let names =
    Dotted_name.Set.of_list (List.map ast ~f:(fun rule -> Pos.value rule.name))
  in
  let ast =
    List.map ast ~f:(fun rule ->
        { name= rule.name
        ; value= resolve_value names (Pos.value rule.name) rule.value
        ; meta= rule.meta } )
  in
  return ~logs:(check_orphan_rules names ast) (ast, names)
