open Core

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
[@@deriving sexp, compare, show]

let to_string = function
  | ADD ->
      "+"
  | SUB ->
      "-"
  | MUL ->
      "*"
  | DIV ->
      "/"
  | POW ->
      "**"
  | GT ->
      ">"
  | LT ->
      "<"
  | GTE ->
      ">="
  | LTE ->
      "<="
  | EQ ->
      "="
  | NEQ ->
      "!="
  | DOT ->
      "."
  | LPAREN ->
      "("
  | RPAREN ->
      ")"
  | EOF ->
      "EOF"
  | DATE_LITERAL (`Day (d, m, y)) ->
      Printf.sprintf "%02d/%02d/%04d" d m y
  | DATE_LITERAL (`Month (m, y)) ->
      Printf.sprintf "%02d/%04d" m y
  | NUMBER (n, Some unit) ->
      Printf.sprintf "%g %s" n unit
  | NUMBER (n, None) ->
      Printf.sprintf "%g" n
  | STRING s ->
      Printf.sprintf "\"%s\"" s
  | RULE_NAME name ->
      Printf.sprintf "%s" name
  | BOOLEAN true ->
      "oui"
  | BOOLEAN false ->
      "non"

let is_operator = function
  | ADD | SUB | MUL | DIV | POW | GT | LT | GTE | LTE | EQ | NEQ ->
      true
  | _ ->
      false

let is_comparison = function GT | LT | GTE | LTE -> true | _ -> false
