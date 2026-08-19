open Shared
open Base

type t = string list Shared_ast.expr [@@deriving equal, compare, show, sexp]
