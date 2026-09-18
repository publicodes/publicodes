open Utils
open Utils.Output.Let_syntax

let parse_expression ~pos str =
  let* tokens = Mark.mk_pos ~pos str |> Lexer.lex in
  Parser.parse tokens
