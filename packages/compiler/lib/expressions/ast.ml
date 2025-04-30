open Core
open Common

type date =
  | Day of { day : int; year : int; month : int }
  | Month of { month : int; year : int }
[@@deriving sexp, compare, show]

type constant =
  | Number of float * Units.t option
  | Bool of bool
  | String of string
  | Date of date
[@@deriving sexp, compare, show]

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

type unary_op = Neg [@@deriving sexp, compare, show]

type t = naked_t

and naked_t =
  | Const of constant
  | Ref of Dotted_name.t
  | BinaryOp of binary_op * t * t
  | UnaryOp of unary_op * t
[@@deriving sexp, compare, show]
