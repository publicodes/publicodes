open Utils
open Utils.Output

let parse_expression ~pos str =
  let* tokens = Pos.mk ~pos str |> Lexer.lex in
  Parser.parse tokens
