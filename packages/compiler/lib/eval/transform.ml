open Ast
open Core
open Utils
open Common

(* Helper function to convert between the two constant types *)
let convert_constant (expr_const, _) =
  match expr_const with
  | Shared_ast.Number (n, _) ->
      Number n
  | Shared_ast.Bool b ->
      Bool b
  | Shared_ast.String s ->
      String s
  | Shared_ast.Date d ->
      Date d

let rec transform_expr expr =
  match expr with
  | Shared_ast.Const value ->
      Const (convert_constant value)
  | Shared_ast.BinaryOp (op, left, right) ->
      BinaryOp (Pos.value op, transform_expr left, transform_expr right)
  | Shared_ast.UnaryOp (op, expr) ->
      UnaryOp (Pos.value op, transform_expr expr)
  | Shared_ast.Ref name -> (
      let name = Pos.value name in
      match name with
      (* We replace not found reference with Undefined *)
      | None ->
          Const Undefined
      | Some name ->
          Ref name )

let transform_value = function
  | Shared_ast.Undefined ->
      Const Undefined
  | Shared_ast.Expr expr ->
      transform_expr expr

let transform ast =
  let evalTree =
    Rule_name.Hashtbl.create ~size:(List.length ast) ~growth_allowed:false ()
  in
  List.iter ast ~f:(fun Shared_ast.{name; value; _} ->
      Hashtbl.add evalTree ~key:(Pos.value name) ~data:(transform_value value)
      |> ignore ) ;
  evalTree
