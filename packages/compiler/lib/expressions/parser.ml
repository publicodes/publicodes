open Tokens
open Ast

let rec parse (expression : token list) =
  let result, remaining = parse_expression expression in
  match remaining with
  | [] -> result
  | EOF :: [] -> result
  | token :: _ ->
      failwith
        ("Unexpected tokens remaining after parsing. Next token: "
       ^ show_token token)

and parse_expression tokens = parse_equality tokens

(* Handle equality operators (= and !=) *)
and parse_equality tokens =
  let left, tokens = parse_comparison tokens in
  match tokens with
  | EQ :: rest ->
      let right, rest = parse_equality rest in
      (BinaryOp (Eq, left, right), rest)
  | NEQ :: rest ->
      let right, rest = parse_equality rest in
      (BinaryOp (NotEq, left, right), rest)
  | _ -> (left, tokens)

(* Handle comparison operators (>, <, >=, <=) *)
and parse_comparison tokens =
  let left, tokens = parse_additive tokens in
  match tokens with
  | GT :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (Gt, left, right), rest)
  | LT :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (Lt, left, right), rest)
  | GTE :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (GtEq, left, right), rest)
  | LTE :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (LtEq, left, right), rest)
  | _ -> (left, tokens)

(* Handle addition and subtraction *)
and parse_additive tokens =
  let left, tokens = parse_multiplicative tokens in
  match tokens with
  | ADD :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (Add, left, right), rest)
  | SUB :: rest ->
      let right, rest = parse_additive rest in
      (BinaryOp (Sub, left, right), rest)
  | _ -> (left, tokens)

(* Handle multiplication and division *)
and parse_multiplicative tokens =
  let left, tokens = parse_power tokens in
  match tokens with
  | MUL :: rest ->
      let right, rest = parse_multiplicative rest in
      (BinaryOp (Mul, left, right), rest)
  | DIV :: rest ->
      let right, rest = parse_multiplicative rest in
      (BinaryOp (Div, left, right), rest)
  | _ -> (left, tokens)

(* Handle exponentiation *)
and parse_power tokens =
  let left, tokens = parse_primary tokens in
  match tokens with
  | POW :: rest ->
      let right, rest = parse_power rest in
      (BinaryOp (Pow, left, right), rest)
  | _ -> (left, tokens)

(* Handle primary expressions: constants, parentheses, rule names *)
and parse_primary tokens =
  match tokens with
  | [] -> failwith "Unexpected end of input"
  | SUB :: rest ->
      let expr, rest = parse_primary rest in
      (UnaryOp (Neg, expr), rest)
  | LPAREN :: rest -> (
      let expr, rest = parse_expression rest in
      match rest with
      | RPAREN :: rest -> (expr, rest)
      | _ -> failwith "Missing closing parenthesis")
  | NUMBER (n, Some unit) :: rest ->
      (Const (Number (n, Some (Units.parse_unit unit))), rest)
  | NUMBER (n, None) :: rest -> (Const (Number (n, None)), rest)
  | STRING s :: rest -> (Const (String s), rest)
  | BOOLEAN b :: rest -> (Const (Bool b), rest)
  | DATE_LITERAL (`Day (d, m, y)) :: rest ->
      (Const (Date (Day { day = d; month = m; year = y })), rest)
  | DATE_LITERAL (`Month (m, y)) :: rest ->
      (Const (Date (Month { month = m; year = y })), rest)
  | RULE_NAME name :: rest -> parse_rule_name [ name ] rest
  | token :: _ -> failwith ("Unexpected token: " ^ show_token token)

and parse_rule_name names tokens =
  match tokens with
  | DOT :: RULE_NAME name :: rest -> parse_rule_name (name :: names) rest
  | tokens -> (Ref (List.rev names), tokens)
