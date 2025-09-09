open Base
open Tokens
open Utils
open Shared.Shared_ast
open Utils.Output

exception SyntaxError of Log.t

let raise_syntax_error ~pos ~code message =
  raise (SyntaxError (Log.error ~kind:`Syntax ~code ~pos message))

let token_at t = Pos.mk (Some t)

let rec parse (expression : Tokens.t Pos.t list) =
  try
    let result, remaining =
      parse_expression expression (Pos.mk None ~pos:Pos.dummy)
    in
    match remaining with
    | [] ->
        return result
    | (EOF, _) :: [] ->
        return result
    | (token, pos) :: _ ->
        let code, message = Err.unexpected_token (Tokens.show token) in
        raise_syntax_error ~pos ~code message
  with SyntaxError log -> (None, [log])

and parse_expression tokens ctx = parse_equality tokens ctx

(* Handle equality operators (= and !=) *)
and parse_equality tokens ctx =
  let left, tokens = parse_comparison tokens ctx in
  match tokens with
  | (EQ, pos) :: rest ->
      let right, rest = parse_equality rest (token_at EQ ~pos) in
      let pos = Pos.merge pos (Pos.pos right) in
      (Pos.mk ~pos (Binary_op (Pos.mk ~pos Eq, left, right)), rest)
  | (NEQ, pos) :: rest ->
      let right, rest = parse_equality rest (token_at NEQ ~pos) in
      let pos = Pos.merge pos (Pos.pos right) in
      (Pos.mk ~pos (Binary_op (Pos.mk ~pos NotEq, left, right)), rest)
  | _ ->
      (left, tokens)

(* Handle comparison operators (>, <, >=, <=) *)
and parse_comparison tokens ctx =
  let left, tokens = parse_additive tokens ctx in
  match tokens with
  | (GT, pos) :: rest ->
      let right, rest = parse_additive rest (token_at GT ~pos) in
      let pos = Pos.merge pos (Pos.pos right) in
      (Pos.mk ~pos (Binary_op (Pos.mk ~pos Gt, left, right)), rest)
  | (LT, pos) :: rest ->
      let right, rest = parse_additive rest (token_at LT ~pos) in
      let pos = Pos.merge pos (Pos.pos right) in
      (Pos.mk ~pos (Binary_op (Pos.mk ~pos Lt, left, right)), rest)
  | (GTE, pos) :: rest ->
      let right, rest = parse_additive rest (token_at GTE ~pos) in
      let pos = Pos.merge pos (Pos.pos right) in
      (Pos.mk ~pos (Binary_op (Pos.mk ~pos GtEq, left, right)), rest)
  | (LTE, pos) :: rest ->
      let right, rest = parse_additive rest (token_at LTE ~pos) in
      let pos = Pos.merge pos (Pos.pos right) in
      (Pos.mk ~pos (Binary_op (Pos.mk ~pos LtEq, left, right)), rest)
  | _ ->
      (left, tokens)

(* Handle addition and subtraction *)
and parse_additive tokens ctx =
  let left, tokens = parse_multiplicative tokens ctx in
  match tokens with
  | (ADD, pos) :: rest ->
      let right, rest = parse_additive rest (token_at ADD ~pos) in
      let pos = Pos.merge pos (Pos.pos right) in
      (Pos.mk ~pos (Binary_op (Pos.mk ~pos Add, left, right)), rest)
  | (SUB, pos) :: rest ->
      let right, rest = parse_additive rest (token_at SUB ~pos) in
      let pos = Pos.merge pos (Pos.pos right) in
      (Pos.mk ~pos (Binary_op (Pos.mk ~pos Sub, left, right)), rest)
  | _ ->
      (left, tokens)

(* Handle multiplication and division *)
and parse_multiplicative tokens ctx =
  let left, tokens = parse_power tokens ctx in
  match tokens with
  | (MUL, pos) :: rest ->
      let right, rest = parse_multiplicative rest (token_at MUL ~pos) in
      let pos = Pos.merge pos (Pos.pos right) in
      let ast = Pos.mk ~pos (Binary_op (Pos.mk ~pos Mul, left, right)) in
      (ast, rest)
  | (DIV, pos) :: rest ->
      let right, rest = parse_multiplicative rest (token_at DIV ~pos) in
      let pos = Pos.merge pos (Pos.pos right) in
      let ast = Pos.mk ~pos (Binary_op (Pos.mk ~pos Div, left, right)) in
      (ast, rest)
  | _ ->
      (left, tokens)

(* Handle exponentiation *)
and parse_power tokens ctx =
  let left, tokens = parse_primary tokens ctx in
  match tokens with
  | (POW, pos) :: rest ->
      let right, rest = parse_power rest (token_at POW ~pos) in
      let pos = Pos.merge pos (Pos.pos right) in
      let ast = Pos.mk ~pos (Binary_op (Pos.mk ~pos Pow, left, right)) in
      (ast, rest)
  | _ ->
      (left, tokens)

(* Handle primary expressions: constants, parentheses, rule names *)
and parse_primary tokens ctx =
  match tokens with
  | [] ->
      failwith "Unexpected end of input"
  | (SUB, pos) :: rest ->
      let expr, rest = parse_primary rest (token_at SUB ~pos) in
      let pos = Pos.merge pos (Pos.pos expr) in
      let ast = Pos.mk ~pos (Unary_op (Pos.mk ~pos Neg, expr)) in
      (ast, rest)
  | (LPAREN, _) :: rest -> (
      let expr, rest = parse_expression rest ctx in
      match rest with
      | (RPAREN, _) :: rest ->
          (expr, rest)
      | _ ->
          let code, message = Err.missing_closing_paren in
          (* TODO: add labels to better error message *)
          raise_syntax_error ~pos:(Pos.pos expr) ~code message )
  | (NUMBER (n, Some unit), pos) :: rest ->
      let value = Number (n, Some (Shared.Units.parse_unit unit)) in
      (Pos.mk ~pos (Const value), rest)
  | (NUMBER (n, None), pos) :: rest ->
      let value = Number (n, None) in
      (Pos.mk ~pos (Const value), rest)
  | (STRING s, pos) :: rest ->
      let value = String s in
      (Pos.mk ~pos (Const value), rest)
  | (BOOLEAN b, pos) :: rest ->
      let value = Bool b in
      (Pos.mk ~pos (Const value), rest)
  | (DATE_LITERAL (`Day (d, m, y)), pos) :: rest ->
      let value = Date (Day {day= d; month= m; year= y}) in
      (Pos.mk ~pos (Const value), rest)
  | (DATE_LITERAL (`Month (m, y)), pos) :: rest ->
      let value = Date (Month {month= m; year= y}) in
      (Pos.mk ~pos (Const value), rest)
  | (RULE_NAME name, pos) :: rest ->
      parse_rule_name ~pos [name] rest
  | (token, pos) :: _ ->
      (* Code for nice error printing *)
      let after_op =
        Pos.value ctx
        |> Option.map ~f:Tokens.is_operator
        |> Option.value ~default:false
      in
      let before_op = Tokens.is_operator token in
      let code, message =
        if after_op || Tokens.is_operator token then Err.malformed_expression
        else Err.invalid_char
      in
      let op_pos = Pos.pos ctx in
      let op_token_str =
        if after_op then
          Pos.value ctx |> Option.value_map ~default:"" ~f:Tokens.to_string
        else if before_op then Tokens.to_string token
        else ""
      in
      let labels =
        if after_op then
          Option.map (Pos.value ctx) ~f:(fun ctx ->
              [ Pos.mk ~pos:op_pos
                  (Printf.sprintf
                     "une valeur ou une référence sont attendues après \
                      l'opérateur `%s`"
                     (Tokens.to_string ctx) ) ] )
          |> Option.value ~default:[]
        else if Tokens.is_operator token then
          [ Pos.mk ~pos
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
  | (DOT, _) :: (RULE_NAME name, end_pos) :: rest ->
      let pos = Pos.merge pos end_pos in
      parse_rule_name ~pos (name :: names) rest
  | _ ->
      (Pos.mk ~pos (Ref (List.rev names)), tokens)
