open! Utils
open! Core

type dotted_name = string list [@@deriving sexp, compare, show]

type date =
  | Day of { day : int; year : int; month : int }
  | Month of { month : int; year : int }
[@@deriving sexp, compare, show]

(* NOTE: needed to avoid error with the constant show ppx *)
[@@@warning "-27"]

type constant =
  | Number of float * Units.t option
  | Bool of bool
  | String of string (* NOTE: could it be a dotted_name here? *)
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

type naked_t =
  | Const of constant
  | Ref of dotted_name
  | BinaryOp of binary_op * naked_t * naked_t
  | UnaryOp of unary_op * naked_t
[@@deriving sexp, compare, show]

type t = naked_t [@@deriving sexp, compare, show]
