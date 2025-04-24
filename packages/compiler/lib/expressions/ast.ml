open Core
open Common

type date =
  | Day of { day : int; year : int; month : int }
  | Month of { month : int; year : int }
[@@deriving sexp, compare, show]

(* Changed from polymorphic to classic variants *)
type constant =
  | Number of float * Units.t option
  | Bool of bool
  | String of string
  | Date of date
[@@deriving sexp, compare, show]

(* Changed from polymorphic to classic variants *)
type binary_op =
  | Add
  | Sub
  | Mul
  | Div
  | Pow
  | Gt
  | Lt
  | GtEq
  | LtEq
  | Eq
  | NotEq
[@@deriving sexp, compare, show]

(* Changed from polymorphic to classic variants *)
type unary_op = Neg [@@deriving sexp, compare, show]

type naked_t =
  | Const of constant
  | Ref of Dotted_name.t
  | BinaryOp of binary_op * naked_t * naked_t
  | UnaryOp of unary_op * naked_t
[@@deriving sexp, compare, show]

type t = naked_t [@@deriving sexp, compare, show]
