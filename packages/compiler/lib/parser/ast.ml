open Core
open Shared

type t = string list Shared_ast.t [@@deriving sexp, compare, show]

type rule_value = string list Shared_ast.rule_value
[@@deriving sexp, compare, show]
