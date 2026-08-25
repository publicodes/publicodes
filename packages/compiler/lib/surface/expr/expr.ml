open Utils
open Utils.Output

let parse_expression ~pos str =
  let* tokens = Mark.mk_pos ~pos str |> Lexer.lex in
  Parser.parse tokens
