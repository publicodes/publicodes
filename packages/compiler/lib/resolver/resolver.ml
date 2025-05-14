open Core
open Utils
open Shared
open Shared.Shared_ast
open Utils.Output

let rec resolve_expr ~rule_names ~context_rule ((expr, pos) : 'a expr) =
  let resolve_expr = resolve_expr ~rule_names ~context_rule in
  let* expr =
    match expr with
    | Ref ref ->
        let ref = Rule_name.resolve ~rule_names ~current:context_rule ref in
        let logs =
          match ref with
          | None ->
              [Log.error ~pos ~kind:`Syntax "La référence n'existe pas"]
          | _ ->
              []
        in
        return ~logs (Ref ref)
    | BinaryOp (operator, left, right) ->
        let* left = resolve_expr left in
        let* right = resolve_expr right in
        return (BinaryOp (operator, left, right))
    | UnaryOp (operator, operand) ->
        let* operand = resolve_expr operand in
        return (UnaryOp (operator, operand))
    | Const expr ->
        return (Const expr)
  in
  return (expr, pos)

let rec resolve_value ~rule_names ~context_rule expr =
  match expr with
  | Expr expr ->
      let* expr = resolve_expr ~rule_names ~context_rule expr in
      return (Expr expr)
  | Undefined pos ->
      return (Undefined pos)
  | Sum (nodes, pos) ->
      let* nodes =
        List.map nodes ~f:(resolve_value ~rule_names ~context_rule) |> from_list
      in
      return (Sum (nodes, pos))

let check_orphan_rules ~rule_names ast =
  let warn_if_orphan {name= name, pos; _} =
    let parent = Rule_name.parent name in
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
                    Rule_name.pp parent )
               "Le parent de la règle n'existe pas" )
        else None
  in
  List.filter_map ast ~f:warn_if_orphan

let resolve_rule ~rule_names rule =
  let+ value =
    resolve_value ~rule_names ~context_rule:(Pos.value rule.name) rule.value
  in
  {rule with value}

let to_resolved_ast ast =
  let rule_names =
    Rule_name.Set.of_list (List.map ast ~f:(fun rule -> Pos.value rule.name))
  in
  let orphan_logs = check_orphan_rules ~rule_names ast in
  let+ ast =
    ast
    |> List.map ~f:(resolve_rule ~rule_names)
    |> from_list |> add_logs ~logs:orphan_logs
  in
  ast
