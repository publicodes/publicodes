open! Base
open Core
open Sedlexing
open Tokens
open Utils.Output
open Lexer
open Utils

let lexstr str = str |> Utf8.from_string |> lex_one

let%test_unit "Lex '+'" = [%test_eq: token] ADD (Pos.value (lexstr "+"))

let%test_unit "Lex '>='" = [%test_eq: token] GTE (Pos.value (lexstr ">="))

let%test_unit "Lex ' . '" = [%test_eq: token] DOT (Pos.value (lexstr " . "))

let%test_unit "Lex Date" =
  [%test_eq: token]
    (DATE_LITERAL (`Day (31, 12, 2024)))
    (Pos.value (lexstr "31/12/2024")) ;
  [%test_eq: token]
    (DATE_LITERAL (`Month (12, 1998)))
    (Pos.value (lexstr "12/1998"))

let%test_unit "Lex Number" =
  [%test_eq: token] (NUMBER (1239., None)) (Pos.value (lexstr "01239")) ;
  [%test_eq: token] (NUMBER (12.098, None)) (Pos.value (lexstr "12.098")) ;
  [%test_eq: token] (NUMBER (12.8, Some "€")) (Pos.value (lexstr "12.80€")) ;
  [%test_eq: token] (NUMBER (42., Some "£")) (Pos.value (lexstr "42 £")) ;
  [%test_eq: token] (NUMBER (42., Some "% /an")) (Pos.value (lexstr "42% /an")) ;
  [%test_eq: token] (NUMBER (312., Some "€/an")) (Pos.value (lexstr "312 €/an")) ;
  [%test_eq: token]
    (NUMBER (1., Some "$ /employé /mois"))
    (Pos.value (lexstr "1 $ /employé /mois")) ;
  [%test_eq: token] (NUMBER (10., Some "%")) (Pos.value (lexstr "10 %")) ;
  [%test_eq: token]
    (NUMBER (42., Some "kW.h/an.personne"))
    (Pos.value (lexstr "42 kW.h/an.personne"))

let%test_unit "Lex string" =
  [%test_eq: token] (STRING "abc") (Pos.value (lexstr "\"abc\"")) ;
  [%test_eq: token] (STRING "1239") (Pos.value (lexstr "\"1239\"")) ;
  [%test_eq: token] (STRING "✨€€") (Pos.value (lexstr "\'✨€€\'"))

let%test_unit "Lex Rule Name" =
  [%test_eq: token] (RULE_NAME "rule_name") (Pos.value (lexstr "rule_name")) ;
  [%test_eq: token] (RULE_NAME "rule name") (Pos.value (lexstr "rule name")) ;
  [%test_eq: token] (RULE_NAME "rule « '$n+ame 12 mo#éè °")
    (Pos.value (lexstr "rule « '$n+ame 12 mo#éè °")) ;
  [%test_eq: token] (RULE_NAME "rule oui da") (Pos.value (lexstr "rule oui da"))

let%test_unit "Lex Boolean" =
  [%test_eq: token] (BOOLEAN true) (Pos.value (lexstr "oui")) ;
  [%test_eq: token] (BOOLEAN false) (Pos.value (lexstr "non"))

let%test_unit "Lex EOF" = [%test_eq: token] EOF (Pos.value (lexstr ""))

let%test_unit "Lex Expressions" =
  let tokens =
    lex (Pos.mk ~pos:Pos.dummy "12 € + 4.5€ * 10 % / règle") |> to_exn
  in
  [%test_eq: token list]
    (List.map ~f:Pos.value tokens)
    [ NUMBER (12., Some "€")
    ; ADD
    ; NUMBER (4.5, Some "€")
    ; MUL
    ; NUMBER (10., Some "%")
    ; DIV
    ; RULE_NAME "règle"
    ; EOF ]

let%test_unit "Lex Expressions with" =
  let tokens = lex (Pos.mk ~pos:Pos.dummy "12 . az . mo / oui") |> to_exn in
  [%test_eq: token list]
    (List.map ~f:Pos.value tokens)
    [ NUMBER (12., None)
    ; DOT
    ; RULE_NAME "az"
    ; DOT
    ; RULE_NAME "mo"
    ; DIV
    ; BOOLEAN true
    ; EOF ]
