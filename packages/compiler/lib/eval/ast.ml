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
[@@deriving sexp, show]

(* We can reuse these types directly *)
type binary_op = Shared_ast.binary_op [@@deriving sexp, show]

type unary_op = Shared_ast.unary_op [@@deriving sexp, show]

type typed_computation =
  | Const of constant
  | Condition of computation * computation * computation
  | BinaryOp of binary_op * computation * computation
  | UnaryOp of unary_op * computation
[@@deriving sexp, show]

and computation = Typed of (typed_computation * Type.id) | Ref of Rule_name.t

type t = (computation * Type.id) Rule_name.Hashtbl.t [@@deriving sexp]

let mk (c : typed_computation) : computation =
  let id = Type.next_id () in
  Typed (c, id)
