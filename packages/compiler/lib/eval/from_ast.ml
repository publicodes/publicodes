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
  | Shared_ast.BinaryOp (op, left, right) ->
      mk ~pos (BinaryOp (op, transform_expr left, transform_expr right))
  | Shared_ast.UnaryOp (op, expr) ->
      mk ~pos (UnaryOp (op, transform_expr expr))
  | Shared_ast.Ref name -> (
    match name with
    (* We replace not found reference with Undefined *)
    | None ->
        mk ~pos (Const Undefined)
    | Some name ->
        mk ~pos (Ref name) )

let rec transform_value = function
  | Shared_ast.Undefined pos ->
      mk ~pos (Const Undefined)
  | Shared_ast.Expr expr ->
      transform_expr expr
  | Shared_ast.Sum sum ->
      transform_sum sum
  | Shared_ast.Product product ->
      transform_product product
  | Shared_ast.AnyOf any_of ->
      transform_any_of any_of
  | Shared_ast.AllOf all_of ->
      transform_all_of all_of

and transform_sum (nodes, pos) =
  List.fold_right nodes ~init:(mk ~pos (Const (Number 0.))) ~f:(fun node acc ->
      mk ~pos (BinaryOp (Pos.mk ~pos Shared_ast.Add, transform_value node, acc)) )

and transform_product (nodes, pos) =
  List.fold_right nodes ~init:(mk ~pos (Const (Number 1.))) ~f:(fun node acc ->
      mk ~pos (BinaryOp (Pos.mk ~pos Shared_ast.Mul, transform_value node, acc)) )

and transform_any_of (nodes, pos) =
  List.fold_right nodes ~init:(mk ~pos (Const (Bool false))) ~f:(fun node acc ->
      mk ~pos (BinaryOp (Pos.mk ~pos Shared_ast.Or, transform_value node, acc)) )

and transform_all_of (nodes, pos) =
  List.fold_right nodes ~init:(mk ~pos (Const (Bool true))) ~f:(fun node acc ->
      mk ~pos (BinaryOp (Pos.mk ~pos Shared_ast.And, transform_value node, acc)) )

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
