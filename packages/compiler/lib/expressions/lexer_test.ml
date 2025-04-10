open! Base
open Sedlexing
open Tokens
open Lexer

let%test_unit "Lex '+'" =
  let lexbuf = Utf8.from_string "+" in
  let token = lex lexbuf in
  [%test_eq: token] ADD token
