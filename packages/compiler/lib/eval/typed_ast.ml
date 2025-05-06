open Core

type type_id = int [@@deriving sexp, show]

type t = type_id Ast.t [@@deriving sexp]
