open Base
open Utils

type date =
  | Day of {day: int; year: int; month: int}
  | Month of {month: int; year: int}
[@@deriving equal, compare, show, sexp]

type constant =
  | Number of float * Units.t option
  | Bool of bool
  | String of string
  | Date of date
[@@deriving equal, compare, show, sexp]

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
  | Max
  | Min
[@@deriving equal, compare, show, sexp]

type unary_op = Neg [@@deriving equal, compare, show, sexp]

type rounding = Up | Down | Nearest [@@deriving equal, compare, show, sexp]

type 'a naked_expr =
  | Const of constant
  | Ref of 'a
  | Binary_op of binary_op Pos.t * 'a expr * 'a expr
  | Unary_op of unary_op Pos.t * 'a expr
[@@deriving equal, compare, show, sexp]

and 'a expr = 'a naked_expr Pos.t [@@deriving equal, compare, show, sexp]

type 'a value_mechanism =
  | Expr of 'a expr
  | Value of 'a value
  | Is_applicable of 'a value
  | Is_not_applicable of 'a value
  | Sum of 'a value list
  | Product of 'a value list
  | All_of of 'a value list
  | Min_of of 'a value list
  | Max_of of 'a value list
  | One_of of 'a value list
  | Undefined
  | Variations of
      (* If-then list *)
      ( 'a variation list
      * (* followed by an optional `else` case *)
      'a value option )
[@@deriving equal, compare, show, sexp]

and 'a variation = {if_: 'a value; then_: 'a value}
[@@deriving equal, compare, show, sexp]

(* The order of chainable mechanisms matters here: it is used to determine the precedence of the mechanisms (first ones are applied first) *)
and 'a chainable_mechanism =
  | Context of ('a Pos.t * 'a value) list
  | Applicable_if of 'a value
  | Not_applicable_if of 'a value
  | Type of Typ.t Pos.t
  | Default of 'a value
  | Ceiling of 'a value
  | Floor of 'a value
  | Round of (rounding * 'a value)
[@@deriving equal, compare, show, sexp]

and 'a value =
  { value: 'a value_mechanism Pos.t
  ; chainable_mechanisms: 'a chainable_mechanism Pos.t list }
[@@deriving equal, show, sexp]

type rule_meta =
  | Title of string
  | Description of string
  | Note of string
  | Public
  | Custom_meta of Yojson.Safe.t
[@@deriving equal, show]

type 'a replace =
  { references: 'a Pos.t list
  ; only_in: 'a Pos.t list
  ; except_in: 'a Pos.t list
  ; priority: int }
[@@deriving equal, show, sexp]

type 'a rule_def =
  { name: Rule_name.t Pos.t
  ; value: 'a value
  ; meta: rule_meta list
  ; replace: 'a replace list
  ; make_not_applicable: 'a replace list }
[@@deriving equal, show]

type 'a program = 'a rule_def list [@@deriving equal, show]

type 'a t = 'a program [@@deriving equal, show]

type resolved = Rule_name.t t [@@deriving equal, show]

let binary_op_to_string = function
  | Add ->
      "+"
  | Sub ->
      "-"
  | Mul ->
      "*"
  | Div ->
      "/"
  | Pow ->
      "**"
  | Gt ->
      ">"
  | Lt ->
      "<"
  | GtEq ->
      ">="
  | LtEq ->
      "<="
  | Eq ->
      "="
  | NotEq ->
      "!="
  | And ->
      "&&"
  | Or ->
      "||"
  | Max ->
      "max"
  | Min ->
      "min"

(** Map expression *)
let has_public_tag rule_def =
  List.exists ~f:(function Public -> true | _ -> false) rule_def.meta

let has_value rule_def =
  match rule_def.value.value with Undefined, _ -> false | _ -> true

let merge (p1 : 'a program) (p2 : 'a program) = List.append p1 p2

let find rule_name =
  List.find_exn ~f:(fun {name; _} -> Rule_name.equal (Pos.value name) rule_name)
