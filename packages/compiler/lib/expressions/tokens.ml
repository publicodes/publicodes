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
  | DATE_LITERAL of int * int * int
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
