open Tokens
open Utils
open Common
open Common.Shared_ast

exception SyntaxError of Log.t

let rec parse (expression : token Pos.t list) =
  let result, remaining = parse_expression expression in
  match remaining with
  | [] ->
      result
  | (EOF, _) :: [] ->
      result
  | (token, _) :: _ ->
      failwith
        ( "Unexpected tokens remaining after parsing. Next token: "
        ^ show_token token )

and parse_expression tokens = parse_equality tokens

(* Handle equality operators (= and !=) *)
and parse_equality tokens =
  let left, tokens = parse_comparison tokens in
  match tokens with
  | (EQ, pos) :: rest ->
      let right, rest = parse_equality rest in
      (BinaryOp (Pos.mk pos Eq, left, right), rest)
  | (NEQ, pos) :: rest ->
      let right, rest = parse_equality rest in
      (BinaryOp (Pos.mk pos NotEq, left, right), rest)
  | _ ->
      (left, tokens)

(* Handle comparison operators (>, <, >=, <=) *)
and parse_comparison tokens =
  let left, tokens = parse_additive tokens in
  match tokens with
  | (GT, pos) :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (Pos.mk pos Gt, left, right), rest)
  | (LT, pos) :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (Pos.mk pos Lt, left, right), rest)
  | (GTE, pos) :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (Pos.mk pos GtEq, left, right), rest)
  | (LTE, pos) :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (Pos.mk pos LtEq, left, right), rest)
  | _ ->
      (left, tokens)

(* Handle addition and subtraction *)
and parse_additive tokens =
  let left, tokens = parse_multiplicative tokens in
  match tokens with
  | (ADD, pos) :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (Pos.mk pos Add, left, right), rest)
  | (SUB, pos) :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (Pos.mk pos Sub, left, right), rest)
  | _ ->
      (left, tokens)

(* Handle multiplication and division *)
and parse_multiplicative tokens =
  let left, tokens = parse_power tokens in
  match tokens with
  | (MUL, pos) :: rest ->
      let right, rest = parse_multiplicative rest in
      (BinaryOp (Pos.mk pos Mul, left, right), rest)
  | (DIV, pos) :: rest ->
      let right, rest = parse_multiplicative rest in
      (BinaryOp (Pos.mk pos Div, left, right), rest)
  | _ ->
      (left, tokens)

(* Handle exponentiation *)
and parse_power tokens =
  let left, tokens = parse_primary tokens in
  match tokens with
  | (POW, pos) :: rest ->
      let right, rest = parse_power rest in
      let ast = BinaryOp (Pos.mk pos Pow, left, right) in
      (ast, rest)
  | _ ->
      (left, tokens)

(* Handle primary expressions: constants, parentheses, rule names *)
and parse_primary tokens =
  match tokens with
  | [] ->
      failwith "Unexpected end of input"
  | (SUB, pos) :: rest ->
      let expr, rest = parse_primary rest in
      (UnaryOp (Pos.mk pos Neg, expr), rest)
  | (LPAREN, _) :: rest -> (
      let expr, rest = parse_expression rest in
      match rest with
      | (RPAREN, _) :: rest ->
          (expr, rest)
      | (_, pos) :: _ ->
          (* Todo add position of the opening parenthesis *)
          raise
            (SyntaxError
               (Log.error ~pos ~kind:`Syntax "Il manque la parenthèse fermante")
            )
      | [] ->
          raise (Invalid_argument "empty token list") )
  | (NUMBER (n, Some unit), pos) :: rest ->
      let value = Number (n, Some (Units.parse_unit unit)) in
      (Const (Pos.mk pos value), rest)
  | (NUMBER (n, None), pos) :: rest ->
      let value = Number (n, None) in
      (Const (Pos.mk pos value), rest)
  | (STRING s, pos) :: rest ->
      let value = String s in
      (Const (Pos.mk pos value), rest)
  | (BOOLEAN b, pos) :: rest ->
      let value = Bool b in
      (Const (Pos.mk pos value), rest)
  | (DATE_LITERAL (`Day (d, m, y)), pos) :: rest ->
      let value = Date (Day {day= d; month= m; year= y}) in
      (Const (Pos.mk pos value), rest)
  | (DATE_LITERAL (`Month (m, y)), pos) :: rest ->
      let value = Date (Month {month= m; year= y}) in
      (Const (Pos.mk pos value), rest)
  | (RULE_NAME name, pos) :: rest ->
      let names, remaining = parse_rule_name [name] rest in
      (Ref (Pos.mk pos names), remaining)
  | (_, pos) :: _ ->
      raise
        (SyntaxError (Log.error ~pos ~kind:`Syntax "Ce caractère est invalide"))

and parse_rule_name names tokens =
  match tokens with
  | (DOT, _) :: (RULE_NAME name, _) :: rest ->
      parse_rule_name (name :: names) rest
  | _ ->
      (List.rev names, tokens)
