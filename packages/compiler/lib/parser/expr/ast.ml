open Shared
open Base

type 'mark t = (string list, 'mark) Shared_ast.expr
[@@deriving equal, compare, show, sexp]
