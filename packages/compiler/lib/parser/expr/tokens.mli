type t =
  | ADD
  | SUB
  | MUL
  | DIV
  | POW
  | GT
  | LT
  | GTE
  | LTE
  | EQ
  | NEQ
  | DOT
  | LPAREN
  | RPAREN
  | EOF
  | DATE_LITERAL of [`Day of int * int * int | `Month of int * int]
  | NUMBER of float * string option
  | STRING of string
  | RULE_NAME of string
  | BOOLEAN of bool
[@@deriving eq, show, sexp, ord]

val to_string : t -> string

val is_operator : t -> bool

val is_comparison : t -> bool
