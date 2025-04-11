open! Base
open Core
open Sedlexing
open Tokens
open Lexer

let lexstr str = str |> Utf8.from_string |> lex
let%test_unit "Lex '+'" = [%test_eq: token] ADD (lexstr "+")
let%test_unit "Lex '>='" = [%test_eq: token] GTE (lexstr ">=")

let%test_unit "Lex Date" =
  [%test_eq: token] (DATE_LITERAL (`Day (31, 12, 2024))) (lexstr "31/12/2024");
  [%test_eq: token] (DATE_LITERAL (`Month (12, 1998))) (lexstr "12/1998")

let%test_unit "Lex Number" =
  [%test_eq: token] (NUMBER 1239.) (lexstr "01239");
  [%test_eq: token] (NUMBER 12.098) (lexstr "12.098")

let%test_unit "Lex string" =
  [%test_eq: token] (STRING "abc") (lexstr "\"abc\"");
  [%test_eq: token] (STRING "1239") (lexstr "\"1239\"");
  [%test_eq: token] (STRING "✨€€") (lexstr "\'✨€€\'")

let%test_unit "Lex Rule Name" =
  [%test_eq: token] (RULE_NAME "rule_name") (lexstr "rule_name");
  [%test_eq: token] (RULE_NAME "rule name") (lexstr "rule name");
  [%test_eq: token] (RULE_NAME "rule « '$n+ame 12 mo#éè °")
    (lexstr "rule « '$n+ame 12 mo#éè °")
