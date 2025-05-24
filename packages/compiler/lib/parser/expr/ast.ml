open Shared
open Core

type t = string list Shared_ast.expr [@@deriving sexp, compare, show]
