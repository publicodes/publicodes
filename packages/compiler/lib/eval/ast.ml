open Core
open Common

(* Extended version of constant with additional variants *)
type constant =
  | Number of float
  | Bool of bool
  | String of string
  | Date of Shared_ast.date
  | Undefined
  | Null
[@@deriving sexp, compare, show]

(* We can reuse these types directly *)
type binary_op = Shared_ast.binary_op [@@deriving sexp, compare, show]

type unary_op = Shared_ast.unary_op [@@deriving sexp, compare, show]

type computation =
  | Const of constant
  | Ref of Rule_name.t
  | Condition of computation * computation * computation
  | BinaryOp of binary_op * computation * computation
  | UnaryOp of unary_op * computation
[@@deriving sexp, compare, show]

type naked_t = computation Rule_name.Hashtbl.t

type t = naked_t
