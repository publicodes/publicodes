open! Core

type rule_value = Expr of Expressions.Ast.t | Undefined
[@@deriving show, sexp, compare]

type rule_meta = Title of string | Description of string
[@@deriving show, sexp, compare]

type rule_def = {
  name :
    (* FIXME: should be [dotted_name]. The one from [Expressions.Ast] should be
		 moved into a shared Ast module *)
    string list;
  value : rule_value;
  meta : rule_meta list;
}
[@@deriving show, sexp, compare]

type program = rule_def list [@@deriving show, sexp, compare]
