open Core

type token =
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
  | DATE_LITERAL of [ `Day of int * int * int | `Month of int * int ]
  | NUMBER of float * string option
  | STRING of string
  | RULE_NAME of string
  | BOOLEAN of bool
[@@deriving sexp, compare, show]

let token_list : (string * token) list =
  [
    ("+", ADD);
    ("-", SUB);
    ("*", MUL);
    ("/", DIV);
    ("**", POW);
    (">", GT);
    ("<", LT);
    (">=", GTE);
    ("<=", LTE);
    ("=", EQ);
    ("!=", NEQ);
    ("(", LPAREN);
    (")", RPAREN);
    (" . ", DOT);
  ]
[@@deriving show]
