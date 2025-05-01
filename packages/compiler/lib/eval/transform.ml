open Ast
open Core
open Utils
open Common

(* Helper function to convert between the two constant types *)
let convert_constant expr_const =
  match expr_const with
  | Expr.Ast.Number (n, _) -> Number n
  | Expr.Ast.Bool b -> Bool b
  | Expr.Ast.String s -> String s
  | Expr.Ast.Date d -> Date d

let rec transform_expr expr =
  match expr with
  | Expr.Ast.Const value -> Const (convert_constant value)
  | Expr.Ast.BinaryOp (op, left, right) ->
      BinaryOp (op, transform_expr left, transform_expr right)
  | Expr.Ast.UnaryOp (op, expr) -> UnaryOp (op, transform_expr expr)
  | Expr.Ast.Ref name -> Ref name

let transform_value = function
  | Parser.Ast.Undefined -> Const Undefined
  | Parser.Ast.Expr expr -> transform_expr expr

let transform ast =
  let evalTree =
    Dotted_name.Hashtbl.create ~size:(List.length ast) ~growth_allowed:false ()
  in
  List.iter ast ~f:(fun Parser.Ast.{ name; value; _ } ->
      Hashtbl.add evalTree ~key:(With_pos.value name)
        ~data:(transform_value value)
      |> ignore);
  evalTree
