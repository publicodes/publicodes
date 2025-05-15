open Eval_tree.Raw
open Core
open Utils
open Shared

let mk = Eval_tree.Raw.mk ~typ:()

(* Helper function to convert between the two constant types *)
let convert_constant expr_const =
  match expr_const with
  | Shared_ast.Number (n, _) ->
      Number n
  | Shared_ast.Bool b ->
      Bool b
  | Shared_ast.String s ->
      String s
  | Shared_ast.Date d ->
      Date d

let rec transform_expr (expr, pos) =
  match expr with
  | Shared_ast.Const value ->
      mk ~pos (Const (convert_constant value))
  | Shared_ast.Binary_op (op, left, right) ->
      mk ~pos (Binary_op (op, transform_expr left, transform_expr right))
  | Shared_ast.Unary_op (op, expr) ->
      mk ~pos (Unary_op (op, transform_expr expr))
  | Shared_ast.Ref name ->
      mk ~pos (Ref name)

let rec transform_value (node, pos) =
  match node with
  | Shared_ast.Undefined ->
      mk ~pos (Const Undefined)
  | Shared_ast.Expr expr ->
      transform_expr expr
  | Shared_ast.Sum sum ->
      transform_sum ~pos sum
  | Shared_ast.Product product ->
      transform_product ~pos product
  | Shared_ast.One_of any_of ->
      transform_any_of ~pos any_of
  | Shared_ast.All_of all_of ->
      transform_all_of ~pos all_of
  | Shared_ast.Applicable_if (applicable_if, value) ->
      transform_applicable_if ~pos applicable_if value
  | Shared_ast.Not_applicable_if (not_applicable_if, value) ->
      transform_not_applicable_if ~pos not_applicable_if value
  | Shared_ast.Ceiling (ceiling, value) ->
      transform_ceiling ~pos ceiling value
  | Shared_ast.Floor (floor, value) ->
      transform_floor ~pos floor value

and transform_sum ~pos nodes =
  List.fold_right nodes ~init:(mk ~pos (Const (Number 0.))) ~f:(fun node acc ->
      mk ~pos (Binary_op (Pos.mk ~pos Shared_ast.Add, transform_value node, acc)) )

and transform_product ~pos nodes =
  List.fold_right nodes ~init:(mk ~pos (Const (Number 1.))) ~f:(fun node acc ->
      mk ~pos (Binary_op (Pos.mk ~pos Shared_ast.Mul, transform_value node, acc)) )

and transform_any_of ~pos nodes =
  List.fold_right nodes ~init:(mk ~pos (Const (Bool false))) ~f:(fun node acc ->
      mk ~pos (Binary_op (Pos.mk ~pos Shared_ast.Or, transform_value node, acc)) )

and transform_all_of ~pos nodes =
  List.fold_right nodes ~init:(mk ~pos (Const (Bool true))) ~f:(fun node acc ->
      mk ~pos (Binary_op (Pos.mk ~pos Shared_ast.And, transform_value node, acc)) )

and transform_applicable_if ~pos condition value =
  let p = mk ~pos in
  let condition = transform_value condition in
  let value = transform_value value in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.Or
              , p
                  (Binary_op
                     ( Pos.mk ~pos Shared_ast.Eq
                     , condition
                     , p (Const (Bool false)) ) )
              , p
                  (Binary_op
                     (Pos.mk ~pos Shared_ast.Eq, condition, p (Const Undefined))
                  ) ) )
       , p (Const Null)
       , value ) )

and transform_not_applicable_if ~pos condition value =
  let p = mk ~pos in
  let condition = transform_value condition in
  let value = transform_value value in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.Or
              , p
                  (Binary_op
                     ( Pos.mk ~pos Shared_ast.Eq
                     , condition
                     , p (Const (Bool false)) ) )
              , p
                  (Binary_op
                     (Pos.mk ~pos Shared_ast.Eq, condition, p (Const Undefined))
                  ) ) )
       , value
       , p (Const Null) ) )

and transform_floor ~pos floor value =
  let p = mk ~pos in
  (* TODO : structural sharing *)
  let floor = transform_value floor in
  let value = transform_value value in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.And
              , p
                  (Binary_op
                     (Pos.mk ~pos Shared_ast.NotEq, floor, p (Const Null)) )
              , p (Binary_op (Pos.mk ~pos Shared_ast.Gt, value, floor)) ) )
       , floor
       , value ) )

and transform_ceiling ~pos ceil value =
  let p = mk ~pos in
  (* TODO : structural sharing *)
  let ceil = transform_value ceil in
  let value = transform_value value in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.And
              , p
                  (Binary_op (Pos.mk ~pos Shared_ast.NotEq, ceil, p (Const Null))
                  )
              , p (Binary_op (Pos.mk ~pos Shared_ast.Lt, value, ceil)) ) )
       , ceil
       , value ) )

let from_ast (resolved_ast : Shared_ast.resolved) : unit t =
  let evalTree =
    Rule_name.Hashtbl.create ~size:(List.length resolved_ast)
      ~growth_allowed:false ()
  in
  List.iter resolved_ast ~f:(fun Shared_ast.{name; value; _} ->
      let key = Pos.value name in
      let data = transform_value value in
      Hashtbl.add evalTree ~key ~data |> ignore ) ;
  evalTree
