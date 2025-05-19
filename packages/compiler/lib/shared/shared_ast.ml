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
  | Binary_op of binary_op Pos.t * 'a expr * 'a expr
  | Unary_op of unary_op Pos.t * 'a expr
[@@deriving show, sexp, compare]

and 'a expr = 'a naked_expr Pos.t [@@deriving show, sexp, compare]

type 'a value_mechanism =
  | Expr of 'a expr
  | Value of 'a value
  | Sum of 'a value list
  | Product of 'a value list
  | All_of of 'a value list
  | One_of of 'a value list
  | Undefined
(* | Variations of
      (* If-then list *)
      ( 'a variation list
      * (* followed by an optional `else` case *)
      'a value option )
      Pos.t *)
[@@deriving show, sexp, compare]

and 'a chainable_mechanism =
  | Context of ('a Pos.t * 'a value) list
  | Applicable_if of 'a value
  | Not_applicable_if of 'a value
  | Ceiling of 'a value
  | Floor of 'a value
[@@deriving show, sexp, compare]

and 'a value =
  { value: 'a value_mechanism Pos.t
  ; chainable_mechanisms: 'a chainable_mechanism Pos.t list }
[@@deriving show, sexp, compare]

(* and 'a variation = {if_: 'a value; then_: 'a value} *)

type rule_meta = Title of string | Description of string | Public
[@@deriving show, sexp, compare]

type 'a rule_def =
  {name: Rule_name.t Pos.t; value: 'a value; meta: rule_meta list}
[@@deriving show, sexp, compare]

type 'a program = 'a rule_def list [@@deriving show, sexp, compare]

type 'a t = 'a program [@@deriving show, sexp, compare]

type resolved = Rule_name.t t [@@deriving show, sexp, compare]

(** Map expression *)
let has_public_tag rule_def =
  List.exists ~f:(function Public -> true | _ -> false) rule_def.meta

let has_value rule_def =
  match rule_def.value.value with Undefined, _ -> false | _ -> true

let merge (p1 : 'a program) (p2 : 'a program) = List.append p1 p2
