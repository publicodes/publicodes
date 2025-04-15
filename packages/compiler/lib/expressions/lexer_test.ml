open! Base
open Core
open Sedlexing
open Tokens
open Lexer

let lexstr str = str |> Utf8.from_string |> lex_one
let%test_unit "Lex '+'" = [%test_eq: token] ADD (lexstr "+")
let%test_unit "Lex '>='" = [%test_eq: token] GTE (lexstr ">=")
let%test_unit "Lex ' . '" = [%test_eq: token] DOT (lexstr " . ")

let%test_unit "Lex Date" =
  [%test_eq: token] (DATE_LITERAL (`Day (31, 12, 2024))) (lexstr "31/12/2024");
  [%test_eq: token] (DATE_LITERAL (`Month (12, 1998))) (lexstr "12/1998")

let%test_unit "Lex Number" =
  [%test_eq: token] (NUMBER (1239., None)) (lexstr "01239");
  [%test_eq: token] (NUMBER (12.098, None)) (lexstr "12.098");
  [%test_eq: token] (NUMBER (12.8, Some "€")) (lexstr "12.80€");
  [%test_eq: token] (NUMBER (42., Some "£")) (lexstr "42 £");
  [%test_eq: token] (NUMBER (42., Some "% /an")) (lexstr "42% /an");
  [%test_eq: token] (NUMBER (312., Some "€/an")) (lexstr "312 €/an");
  [%test_eq: token]
    (NUMBER (1., Some "$ /employé /mois"))
    (lexstr "1 $ /employé /mois");
  [%test_eq: token] (NUMBER (10., Some "%")) (lexstr "10 %");
  [%test_eq: token]
    (NUMBER (42., Some "kW.h/an.personne"))
    (lexstr "42 kW.h/an.personne")

let%test_unit "Lex string" =
  [%test_eq: token] (STRING "abc") (lexstr "\"abc\"");
  [%test_eq: token] (STRING "1239") (lexstr "\"1239\"");
  [%test_eq: token] (STRING "✨€€") (lexstr "\'✨€€\'")

let%test_unit "Lex Rule Name" =
  [%test_eq: token] (RULE_NAME "rule_name") (lexstr "rule_name");
  [%test_eq: token] (RULE_NAME "rule name") (lexstr "rule name");
  [%test_eq: token] (RULE_NAME "rule « '$n+ame 12 mo#éè °")
    (lexstr "rule « '$n+ame 12 mo#éè °");
  [%test_eq: token] (RULE_NAME "rule oui da") (lexstr "rule oui da")

let%test_unit "Lex Boolean" =
  [%test_eq: token] (BOOLEAN true) (lexstr "oui");
  [%test_eq: token] (BOOLEAN false) (lexstr "non")

let%test_unit "Lex EOF" = [%test_eq: token] EOF (lexstr "")

let%test_unit "Lex Expressions" =
  [%test_eq: token list]
    (lex "12 € + 4.5€ * 10 % / règle")
    [
      NUMBER (12., Some "€");
      ADD;
      NUMBER (4.5, Some "€");
      MUL;
      NUMBER (10., Some "%");
      DIV;
      RULE_NAME "règle";
      EOF;
    ]

let%test_unit "Lex Expressions with" =
  [%test_eq: token list] (lex "12 . az . mo / oui")
    [
      NUMBER (12., None);
      DOT;
      RULE_NAME "az";
      DOT;
      RULE_NAME "mo";
      DIV;
      BOOLEAN true;
      EOF;
    ]
