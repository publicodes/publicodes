open Base

type literal = String | Bool | Date [@@deriving equal, compare, show, sexp]

type t = Literal of literal | Symbol of string | Number of Units.t option
[@@deriving equal, compare, show, sexp]
