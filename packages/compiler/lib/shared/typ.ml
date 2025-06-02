open Core

type literal = String | Bool | Date [@@deriving sexp, compare, show]

type t = Literal of literal | Number of Units.t option
[@@deriving sexp, compare, show]
