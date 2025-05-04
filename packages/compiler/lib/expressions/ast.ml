open Core
open Common
open Utils

type date =
  | Day of {day: int; year: int; month: int}
  | Month of {month: int; year: int}
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

type expr =
  | Const of constant Pos.t
  | Ref of Dotted_name.t Pos.t
  | BinaryOp of binary_op Pos.t * t * t
  | UnaryOp of unary_op Pos.t * t

and t = expr [@@deriving sexp, compare, show]
