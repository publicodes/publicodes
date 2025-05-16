open Core
open Shared
include Shared_ast

type t = string list Shared_ast.t [@@deriving sexp, compare, show]

type value = string list Shared_ast.value [@@deriving sexp, compare, show]
