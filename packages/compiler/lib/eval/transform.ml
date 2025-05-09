open Ast
open Core
open Utils
open Common

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
        Ref (Pos.mk pos name) )

let transform_value = function
  | Shared_ast.Undefined pos ->
      mk ~pos (Const Undefined)
  | Shared_ast.Expr expr ->
      transform_expr expr

let transform (resolved_ast : Shared_ast.resolved) : Ast.t =
  let evalTree =
    Rule_name.Hashtbl.create ~size:(List.length resolved_ast)
      ~growth_allowed:false ()
  in
  List.iter resolved_ast ~f:(fun Shared_ast.{name; value; _} ->
      let type_id = Node_id.next () in
      let key = Pos.value name in
      let data = ((transform_value value, type_id), Pos.pos name) in
      Hashtbl.add evalTree ~key ~data |> ignore ) ;
  evalTree
