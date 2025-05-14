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

and transform_sum (nodes, pos) =
  List.fold_right nodes ~init:(mk ~pos (Const Null)) ~f:(fun node acc ->
      mk ~pos (BinaryOp (Pos.mk ~pos Shared_ast.Add, transform_value node, acc)) )

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
