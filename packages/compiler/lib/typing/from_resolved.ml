open Base
open Shared
open Utils

let rec transform_expr (expr : Shared_ast.resolved_expr) : Ast.wip_expr =
  let expr, ({Mark.pos} as mark) = expr in
  let mk = Ast.from_mark mark in
  match expr with
  | Const (Number (number, unit)) as expr ->
      (expr, mk (Ast.mk_lit_number ~pos number unit))
  | Const (Bool bool) as expr ->
      (expr, mk (Ast.mk_lit_bool ~pos bool))
  | Const (String string) as expr ->
      (expr, mk (Ast.mk_lit_string ~pos string))
  | Const (Symbol symbol) as expr ->
      (expr, mk (Ast.mk_lit_symbol ~pos symbol))
  | Const (Date (Day {day; year; month})) as expr ->
      (expr, mk (Ast.mk_lit_day ~pos day year month))
  | Const (Date (Month {year; month})) as expr ->
      (expr, mk (Ast.mk_lit_month ~pos year month))
  | Ref _ as expr ->
      (expr, mk (Ast.mk_any ~pos))
  | Binary_op (op, left, right) ->
      let left = transform_expr left in
      let right = transform_expr right in
      let mark =
        match fst op with
        | And | Or | Gt | Lt | LtEq | GtEq | Eq | NotEq ->
            Ast.mk_bool ~pos
        | _ ->
            Ast.mk_any ~pos
      in
      (Binary_op (op, left, right), mk mark)
  | Unary_op (op, value) ->
      let value = transform_expr value in
      (Unary_op (op, value), mk (Ast.mk_any ~pos))

and transform_value_mechanism (value : Shared_ast.resolved_value_mechanism) :
    Ast.wip_value_mechanism =
  match value with
  | Expr expr ->
      let expr = transform_expr expr in
      Expr expr
  | Value value ->
      let value = transform_value value in
      Value value
  | Is_applicable value ->
      let value = transform_value value in
      Is_applicable value
  | Is_not_applicable value ->
      let value = transform_value value in
      Is_not_applicable value
  | Sum values ->
      let values = List.map values ~f:transform_value in
      Sum values
  | Product values ->
      let values = List.map values ~f:transform_value in
      Product values
  | Average values ->
      let values = List.map values ~f:transform_value in
      Average values
  | All_of values ->
      let values = List.map values ~f:transform_value in
      All_of values
  | Min_of values ->
      let values = List.map values ~f:transform_value in
      Min_of values
  | Max_of values ->
      let values = List.map values ~f:transform_value in
      Max_of values
  | One_of values ->
      let values = List.map values ~f:transform_value in
      One_of values
  | Not_defined ->
      Not_defined
  | Variations (variations, value) ->
      let variations =
        List.map variations ~f:(fun variation ->
            let {Shared_ast.if_; then_} = variation in
            let if_ = transform_value if_ in
            let then_ = transform_value then_ in
            {Shared_ast.if_; then_} )
      in
      let value =
        match value with
        | None ->
            None
        | Some value ->
            let value = transform_value value in
            Some value
      in
      Variations (variations, value)

and transform_chainable_mechanism
    (chainable : Shared_ast.resolved_chainable_mechanism) :
    Ast.wip_chainable_mechanism =
  match chainable with
  | Context values ->
      let values =
        List.map values ~f:(fun value ->
            let ref, value = value in
            let value = transform_value value in
            (ref, value) )
      in
      Context values
  | Applicable_if value ->
      let value = transform_value value in
      Applicable_if value
  | Not_applicable_if value ->
      let value = transform_value value in
      Not_applicable_if value
  | Type typ ->
      Type typ
  | Default value ->
      let value = transform_value value in
      Default value
  | Ceiling value ->
      let value = transform_value value in
      Ceiling value
  | Floor value ->
      let value = transform_value value in
      Floor value
  | Round (rounding, value) ->
      let value = transform_value value in
      Round (rounding, value)

and transform_value (value : Shared_ast.resolved_value) : Ast.wip_value =
  let {Shared_ast.value; chainable_mechanisms}, ({Mark.pos} as mark) = value in
  let value =
    let value, ({Mark.pos} as mark) = value in
    let value = transform_value_mechanism value in
    (value, Ast.mk_any ~pos |> Ast.from_mark mark)
  in
  let chainable_mechanisms =
    List.map chainable_mechanisms ~f:(fun chainable ->
        let chainable, ({Mark.pos} as mark) = chainable in
        let chainable = transform_chainable_mechanism chainable in
        (chainable, Ast.mk_any ~pos |> Ast.from_mark mark) )
  in
  ( {Shared_ast.value; chainable_mechanisms}
  , Ast.mk_any ~pos |> Ast.from_mark mark )

let transform_rule_def (rule_def : Shared_ast.resolved_rule_def) :
    Ast.wip_rule_def =
  let {Shared_ast.value; _} = rule_def in
  let value = transform_value value in
  {rule_def with value}

let from_resolved (ast : Shared_ast.resolved) : Ast.wip_tree =
  List.map ast ~f:transform_rule_def
  |> List.map ~f:(fun rule_def ->
      let {Shared_ast.name; _} = rule_def in
      (Mark.remove name, (rule_def, ref Ast.Todo)) )
  |> List.stable_dedup ~compare:(fun (name1, _) (name2, _) ->
      Rule_name.compare name1 name2 )
  |> Hashtbl.of_alist_exn (module Shared.Rule_name) ~growth_allowed:false
