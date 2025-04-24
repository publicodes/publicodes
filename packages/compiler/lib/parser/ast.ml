open Core
open! Common

type rule_value = Expr of Expr.Ast.t | Undefined
[@@deriving show, sexp, compare]

type rule_meta = Title of string | Description of string
[@@deriving show, sexp, compare]

type rule_def = {
  name : Dotted_name.t;
  value : rule_value;
  meta : rule_meta list;
}
[@@deriving show, sexp, compare]

type program = rule_def list [@@deriving show, sexp, compare]
type t = program [@@deriving show, sexp, compare]
