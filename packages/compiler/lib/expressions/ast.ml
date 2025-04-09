open Utils

type dotted_name = string list [@@deriving show]
type date = { day : int; year : int; month : int } [@@deriving show]
type number = Int of int | Decimal of float [@@deriving show]

(* NOTE: needed to avoid error with the constant show ppx *)
[@@@warning "-27"]

type constant =
  | Number of number * unit option
  | Bool of bool
  | String of
      (* NOTE: could it be a dotted_name here? *)
      string
  | Date of date
[@@deriving show]

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
[@@deriving show]

type unary_op = Minus [@@deriving show]

type naked_t =
  | Const of constant
  | Ref of dotted_name
  | BinaryOp of binary_op Loc.with_loc * naked_t * naked_t
  | UnaryOp of unary_op Loc.with_loc * naked_t
[@@deriving show]

type t = naked_t Loc.with_loc [@@deriving show]
