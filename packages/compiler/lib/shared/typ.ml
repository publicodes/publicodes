open Core
type literal = String | Bool | Date [@@deriving eq, ord, show, sexp]

type t = Literal of literal | Number of Units.t option
[@@deriving eq, ord, show, sexp]
