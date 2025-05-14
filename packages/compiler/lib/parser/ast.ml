open Core
open Shared

type t = string list Shared_ast.t [@@deriving sexp, compare, show]

type value = string list Shared_ast.value [@@deriving sexp, compare, show]
