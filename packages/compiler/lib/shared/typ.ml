open Base

type literal = String | Symbol | Bool | Date
[@@deriving equal, compare, show, sexp]

type t =
  | Literal of literal
  | Number of Units.t option
  | Enum of string Utils.Pos.t list
[@@deriving equal, compare, show, sexp]
