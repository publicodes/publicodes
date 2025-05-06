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

type 'typ computation =
  | Const of constant
  | Ref of Rule_name.t
  | Condition of
      'typ typed_computation * 'typ typed_computation * 'typ typed_computation
  | BinaryOp of binary_op * 'typ typed_computation * 'typ typed_computation
  | UnaryOp of unary_op * 'typ typed_computation
[@@deriving sexp, compare, show]

and 'typ typed_computation = 'typ computation * 'typ
[@@deriving sexp, compare, show]

type 'typ t = 'typ typed_computation Rule_name.Hashtbl.t [@@deriving sexp]
