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
  | (EQ, op_pos) :: rest ->
      let right, rest = parse_equality rest in
      let pos = Pos.merge op_pos (Pos.pos right) in
      (Pos.mk pos (BinaryOp (Pos.mk op_pos Eq, left, right)), rest)
  | (NEQ, op_pos) :: rest ->
      let right, rest = parse_equality rest in
      let pos = Pos.merge op_pos (Pos.pos right) in
      (Pos.mk pos (BinaryOp (Pos.mk op_pos NotEq, left, right)), rest)
  | _ ->
      (left, tokens)

(* Handle comparison operators (>, <, >=, <=) *)
and parse_comparison tokens =
  let left, tokens = parse_additive tokens in
  match tokens with
  | (GT, op_pos) :: rest ->
      let right, rest = parse_additive rest in
      let pos = Pos.merge op_pos (Pos.pos right) in
      (Pos.mk pos (BinaryOp (Pos.mk op_pos Gt, left, right)), rest)
  | (LT, op_pos) :: rest ->
      let right, rest = parse_additive rest in
      let pos = Pos.merge op_pos (Pos.pos right) in
      (Pos.mk pos (BinaryOp (Pos.mk op_pos Lt, left, right)), rest)
  | (GTE, op_pos) :: rest ->
      let right, rest = parse_additive rest in
      let pos = Pos.merge op_pos (Pos.pos right) in
      (Pos.mk pos (BinaryOp (Pos.mk op_pos GtEq, left, right)), rest)
  | (LTE, op_pos) :: rest ->
      let right, rest = parse_additive rest in
      let pos = Pos.merge op_pos (Pos.pos right) in
      (Pos.mk pos (BinaryOp (Pos.mk op_pos LtEq, left, right)), rest)
  | _ ->
      (left, tokens)

(* Handle addition and subtraction *)
and parse_additive tokens =
  let left, tokens = parse_multiplicative tokens in
  match tokens with
  | (ADD, op_pos) :: rest ->
      let right, rest = parse_additive rest in
      let pos = Pos.merge op_pos (Pos.pos right) in
      (Pos.mk pos (BinaryOp (Pos.mk op_pos Add, left, right)), rest)
  | (SUB, op_pos) :: rest ->
      let right, rest = parse_additive rest in
      let pos = Pos.merge op_pos (Pos.pos right) in
      (Pos.mk pos (BinaryOp (Pos.mk op_pos Sub, left, right)), rest)
  | _ ->
      (left, tokens)

(* Handle multiplication and division *)
and parse_multiplicative tokens =
  let left, tokens = parse_power tokens in
  match tokens with
  | (MUL, op_pos) :: rest ->
      let right, rest = parse_multiplicative rest in
      let pos = Pos.merge op_pos (Pos.pos right) in
      let ast = Pos.mk pos (BinaryOp (Pos.mk op_pos Mul, left, right)) in
      (ast, rest)
  | (DIV, op_pos) :: rest ->
      let right, rest = parse_multiplicative rest in
      let pos = Pos.merge op_pos (Pos.pos right) in
      let ast = Pos.mk pos (BinaryOp (Pos.mk op_pos Div, left, right)) in
      (ast, rest)
  | _ ->
      (left, tokens)

(* Handle exponentiation *)
and parse_power tokens =
  let left, tokens = parse_primary tokens in
  match tokens with
  | (POW, op_pos) :: rest ->
      let right, rest = parse_power rest in
      let pos = Pos.merge op_pos (Pos.pos right) in
      let ast = Pos.mk pos (BinaryOp (Pos.mk op_pos Pow, left, right)) in
      (ast, rest)
  | _ ->
      (left, tokens)

(* Handle primary expressions: constants, parentheses, rule names *)
and parse_primary tokens =
  match tokens with
  | [] ->
      failwith "Unexpected end of input"
  | (SUB, op_pos) :: rest ->
      let expr, rest = parse_primary rest in
      let pos = Pos.merge op_pos (Pos.pos expr) in
      let ast = Pos.mk pos (UnaryOp (Pos.mk op_pos Neg, expr)) in
      (ast, rest)
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
      (Pos.mk pos (Const value), rest)
  | (NUMBER (n, None), pos) :: rest ->
      let value = Number (n, None) in
      (Pos.mk pos (Const value), rest)
  | (STRING s, pos) :: rest ->
      let value = String s in
      (Pos.mk pos (Const value), rest)
  | (BOOLEAN b, pos) :: rest ->
      let value = Bool b in
      (Pos.mk pos (Const value), rest)
  | (DATE_LITERAL (`Day (d, m, y)), pos) :: rest ->
      let value = Date (Day {day= d; month= m; year= y}) in
      (Pos.mk pos (Const value), rest)
  | (DATE_LITERAL (`Month (m, y)), pos) :: rest ->
      let value = Date (Month {month= m; year= y}) in
      (Pos.mk pos (Const value), rest)
  | (RULE_NAME name, pos) :: rest ->
      parse_rule_name ~pos [name] rest
  | (_, pos) :: _ ->
      raise
        (SyntaxError (Log.error ~pos ~kind:`Syntax "Ce caractère est invalide"))

and parse_rule_name ~pos names tokens =
  match tokens with
  | (DOT, _) :: (RULE_NAME name, end_pos) :: rest ->
      let pos = Pos.merge pos end_pos in
      parse_rule_name ~pos (name :: names) rest
  | _ ->
      (Pos.mk pos (Ref (List.rev names)), tokens)
