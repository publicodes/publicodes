open Utils
open Base
open Tokens
open Utils.Output
module Shared_ast = Shared.Shared_ast

exception SyntaxError of Log.t

let raise_syntax_error ~pos ~code message =
  raise (SyntaxError (Log.error ~kind:`Syntax ~code ~pos message))

let token_at ~pos t = Mark.mk_pos ~pos (Some t)

let mk_expr ~pos expr = Mark.mk_pos ~pos expr

let rec parse (expression : Tokens.t Mark.pos list) =
  try
    let result, remaining =
      parse_expression expression (Mark.mk_pos ~pos:Pos.dummy None)
    in
    match remaining with
    | [] ->
        return result
    | (EOF, _) :: [] ->
        return result
    | (token, Mark.{pos; _}) :: _ ->
        let code, message = Err.unexpected_token (Tokens.show token) in
        raise_syntax_error ~pos ~code message
  with SyntaxError log -> (None, [log])

and parse_expression tokens ctx = parse_equality tokens ctx

(* Handle equality operators (= and !=) *)
and parse_equality tokens ctx :
    (_, Mark.pos_mark) Shared_ast.expr * Tokens.t Mark.pos list =
  let left, tokens = parse_comparison tokens ctx in
  match tokens with
  | (EQ, Mark.{pos}) :: rest ->
      let right, rest = parse_equality rest (token_at ~pos EQ) in
      let pos = Pos.merge pos (Mark.pos right) in
      ( mk_expr ~pos Shared_ast.(Binary_op (Mark.mk_pos ~pos Eq, left, right))
      , rest )
  | (NEQ, {pos}) :: rest ->
      let right, rest = parse_equality rest (token_at ~pos NEQ) in
      let pos = Pos.merge pos (Mark.pos right) in
      ( mk_expr ~pos Shared_ast.(Binary_op (Mark.mk_pos ~pos NotEq, left, right))
      , rest )
  | _ ->
      (left, tokens)

(* Handle comparison operators (>, <, >=, <=) *)
and parse_comparison tokens ctx =
  let left, tokens = parse_additive tokens ctx in
  let left_pos = Mark.pos left in
  match tokens with
  | (GT, Mark.{pos}) :: rest ->
      let right, rest = parse_additive rest (token_at ~pos GT) in
      let right_pos = Mark.pos right in
      let pos = Pos.merge left_pos right_pos in
      ( mk_expr ~pos Shared_ast.(Binary_op (Mark.mk_pos ~pos Gt, left, right))
      , rest )
  | (LT, {pos}) :: rest ->
      let right, rest = parse_additive rest (token_at ~pos LT) in
      let right_pos = Mark.pos right in
      let pos = Pos.merge left_pos right_pos in
      ( mk_expr ~pos Shared_ast.(Binary_op (Mark.mk_pos ~pos Lt, left, right))
      , rest )
  | (GTE, {pos}) :: rest ->
      let right, rest = parse_additive rest (token_at ~pos GTE) in
      let right_pos = Mark.pos right in
      let pos = Pos.merge left_pos right_pos in
      ( mk_expr ~pos Shared_ast.(Binary_op (Mark.mk_pos ~pos GtEq, left, right))
      , rest )
  | (LTE, {pos}) :: rest ->
      let right, rest = parse_additive rest (token_at ~pos LTE) in
      let right_pos = Mark.pos right in
      let pos = Pos.merge pos right_pos in
      ( mk_expr ~pos Shared_ast.(Binary_op (Mark.mk_pos ~pos LtEq, left, right))
      , rest )
  | _ ->
      (left, tokens)

(* Handle addition and subtraction *)
and parse_additive tokens ctx =
  let left, tokens = parse_multiplicative tokens ctx in
  let left_pos = Mark.pos left in
  match tokens with
  | (ADD, Mark.{pos}) :: rest ->
      let right, rest = parse_additive rest (token_at ~pos ADD) in
      let right_pos = Mark.pos right in
      let pos = Pos.merge left_pos right_pos in
      ( mk_expr ~pos Shared_ast.(Binary_op (Mark.mk_pos ~pos Add, left, right))
      , rest )
  | (SUB, {pos}) :: rest ->
      let right, rest = parse_additive rest (token_at ~pos SUB) in
      let right_pos = Mark.pos right in
      let pos = Pos.merge left_pos right_pos in
      ( mk_expr ~pos Shared_ast.(Binary_op (Mark.mk_pos ~pos Sub, left, right))
      , rest )
  | _ ->
      (left, tokens)

(* Handle multiplication and division *)
and parse_multiplicative tokens ctx :
    ('a, Mark.pos_mark) Shared_ast.expr * Tokens.t Mark.pos list =
  let left, tokens = parse_power tokens ctx in
  let left_pos = Mark.pos left in
  match tokens with
  | (MUL, Mark.{pos}) :: rest ->
      let right, rest = parse_multiplicative rest (token_at ~pos MUL) in
      let right_pos = Mark.pos right in
      let pos = Pos.merge left_pos right_pos in
      let ast =
        mk_expr ~pos Shared_ast.(Binary_op (Mark.mk_pos ~pos Mul, left, right))
      in
      (ast, rest)
  | (DIV, {pos}) :: rest ->
      let right, rest = parse_multiplicative rest (token_at ~pos DIV) in
      let right_pos = Mark.pos right in
      let pos = Pos.merge left_pos right_pos in
      let ast =
        mk_expr ~pos Shared_ast.(Binary_op (Mark.mk_pos ~pos Div, left, right))
      in
      (ast, rest)
  | _ ->
      (left, tokens)

(* Handle exponentiation *)
and parse_power tokens ctx :
    ('a, Mark.pos_mark) Shared_ast.expr * Tokens.t Mark.pos list =
  let left, tokens = parse_primary tokens ctx in
  let left_pos = Mark.pos left in
  match tokens with
  | (POW, Mark.{pos}) :: rest ->
      let right, rest = parse_power rest (token_at ~pos POW) in
      let right_pos = Mark.pos right in
      let pos = Pos.merge left_pos right_pos in
      let ast =
        mk_expr ~pos Shared_ast.(Binary_op (Mark.mk_pos ~pos Pow, left, right))
      in
      (ast, rest)
  | _ ->
      (left, tokens)

(* Handle primary expressions: constants, parentheses, rule names *)
and parse_primary tokens ctx :
    ('a, Mark.pos_mark) Shared_ast.expr * Tokens.t Mark.pos list =
  match tokens with
  | [] ->
      failwith "Unexpected end of input"
  | (SUB, Mark.{pos}) :: rest ->
      let expr, rest = parse_primary rest (token_at ~pos SUB) in
      let expr_pos = Mark.pos expr in
      let pos = Pos.merge pos expr_pos in
      let ast =
        mk_expr ~pos Shared_ast.(Unary_op (Mark.mk_pos ~pos Neg, expr))
      in
      (ast, rest)
  | (LPAREN, _) :: rest -> (
      let expr, rest = parse_expression rest ctx in
      match rest with
      | (RPAREN, _) :: rest ->
          (expr, rest)
      | _ ->
          let code, message = Err.missing_closing_paren in
          let pos = Mark.pos expr in
          (* TODO: add labels to better error message *)
          raise_syntax_error ~pos ~code message )
  | (NUMBER (n, Some unit), {pos}) :: rest ->
      let value =
        Shared_ast.(Number (n, Some (Shared.Units.parse_unit unit)))
      in
      (mk_expr ~pos Shared_ast.(Const value), rest)
  | (NUMBER (n, None), {pos}) :: rest ->
      let value = Shared_ast.Number (n, None) in
      (mk_expr ~pos Shared_ast.(Const value), rest)
  | (STRING s, {pos}) :: rest ->
      let value = Shared_ast.String s in
      (mk_expr ~pos Shared_ast.(Const value), rest)
  | (SYMBOL s, {pos}) :: rest ->
      let value = Shared_ast.Symbol s in
      (mk_expr ~pos Shared_ast.(Const value), rest)
  | (BOOLEAN b, {pos}) :: rest ->
      let value = Shared_ast.Bool b in
      (mk_expr ~pos Shared_ast.(Const value), rest)
  | (DATE_LITERAL (`Day (d, m, y)), {pos}) :: rest ->
      let value = Shared_ast.(Date (Day {day= d; month= m; year= y})) in
      (mk_expr ~pos Shared_ast.(Const value), rest)
  | (DATE_LITERAL (`Month (m, y)), {pos}) :: rest ->
      let value = Shared_ast.(Date (Month {month= m; year= y})) in
      (mk_expr ~pos Shared_ast.(Const value), rest)
  | (RULE_NAME name, {pos}) :: rest ->
      parse_rule_name ~pos [name] rest
  | (token, {pos}) :: _ ->
      (* Code for nice error printing *)
      let after_op =
        Mark.remove ctx
        |> Option.map ~f:Tokens.is_operator
        |> Option.value ~default:false
      in
      let before_op = Tokens.is_operator token in
      let code, message =
        if after_op || Tokens.is_operator token then Err.malformed_expression
        else Err.invalid_char
      in
      let op_pos = Mark.pos ctx in
      let op_token_str =
        if after_op then
          Mark.remove ctx |> Option.value_map ~default:"" ~f:Tokens.to_string
        else if before_op then Tokens.to_string token
        else ""
      in
      let labels =
        if after_op then
          Option.map (Mark.remove ctx) ~f:(fun ctx ->
              [ Mark.mk_pos ~pos:op_pos
                  (Printf.sprintf
                     "une valeur ou une référence sont attendues après \
                      l'opérateur `%s`"
                     (Tokens.to_string ctx) ) ] )
          |> Option.value ~default:[]
        else if Tokens.is_operator token then
          [ Mark.mk_pos ~pos
              (Printf.sprintf
                 "une valeur (nombre, booléean, date) ou une référence est \
                  attendue AVANT l'opérateur `%s`"
                 (Tokens.to_string token) ) ]
        else []
      in
      let hints =
        if String.is_empty op_token_str then []
        else
          [ Printf.sprintf
              "supprimez l'opérateur `%s` ou bien ajoutez une expression"
              op_token_str ]
      in
      raise
        (SyntaxError (Log.error message ~pos ~kind:`Syntax ~code ~labels ~hints))

and parse_rule_name ~pos names tokens =
  match tokens with
  | (DOT, _) :: (RULE_NAME name, {pos= end_pos}) :: rest ->
      let pos = Pos.merge pos end_pos in
      parse_rule_name ~pos (name :: names) rest
  | _ ->
      (mk_expr ~pos Shared_ast.(Ref (List.rev names)), tokens)
