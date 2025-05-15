open Core
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
  | And
  | Or
[@@deriving sexp, compare, show]

type unary_op = Neg [@@deriving sexp, compare, show]

type 'a naked_expr =
  | Const of constant
  | Ref of 'a
  | BinaryOp of binary_op Pos.t * 'a expr * 'a expr
  | UnaryOp of unary_op Pos.t * 'a expr
[@@deriving show, sexp, compare]

and 'a expr = 'a naked_expr Pos.t [@@deriving show, sexp, compare]

type 'a value =
  | Expr of 'a expr
  | Undefined of Pos.pos
  | Sum of 'a value list Pos.t
  | Product of 'a value list Pos.t
  | AllOf of 'a value list Pos.t
  | AnyOf of 'a value list Pos.t
[@@deriving show, sexp, compare]

type rule_meta = Title of string | Description of string | Public
[@@deriving show, sexp, compare]

type 'a rule_def =
  {name: Rule_name.t Pos.t; value: 'a value; meta: rule_meta list}
[@@deriving show, sexp, compare]

type 'a program = 'a rule_def list [@@deriving show, sexp, compare]

type 'a t = 'a program [@@deriving show, sexp, compare]

type resolved = Rule_name.t option t [@@deriving show, sexp, compare]

let has_public_tag rule_def =
  List.exists ~f:(function Public -> true | _ -> false) rule_def.meta

let has_value rule_def =
  match rule_def.value with Undefined _ -> false | _ -> true
