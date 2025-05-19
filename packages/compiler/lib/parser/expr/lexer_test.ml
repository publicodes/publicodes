open! Base
open Core
open Sedlexing
open Tokens
open Utils.Output
open Lexer
open Utils

let lexstr str = str |> Utf8.from_string |> lex_one

let%test_unit "Lex '+'" = [%test_eq: Tokens.t] ADD (Pos.value (lexstr "+"))

let%test_unit "Lex '>='" = [%test_eq: Tokens.t] GTE (Pos.value (lexstr ">="))

let%test_unit "Lex ' . '" = [%test_eq: Tokens.t] DOT (Pos.value (lexstr " . "))

let%test_unit "Lex Date" =
  [%test_eq: Tokens.t]
    (DATE_LITERAL (`Day (31, 12, 2024)))
    (Pos.value (lexstr "31/12/2024")) ;
  [%test_eq: Tokens.t]
    (DATE_LITERAL (`Month (12, 1998)))
    (Pos.value (lexstr "12/1998"))

let%test_unit "Lex Number" =
  [%test_eq: Tokens.t] (NUMBER (1239., None)) (Pos.value (lexstr "01239")) ;
  [%test_eq: Tokens.t] (NUMBER (12.098, None)) (Pos.value (lexstr "12.098")) ;
  [%test_eq: Tokens.t] (NUMBER (12.8, Some "€")) (Pos.value (lexstr "12.80€")) ;
  [%test_eq: Tokens.t] (NUMBER (42., Some "£")) (Pos.value (lexstr "42 £")) ;
  [%test_eq: Tokens.t]
    (NUMBER (42., Some "% /an"))
    (Pos.value (lexstr "42% /an")) ;
  [%test_eq: Tokens.t]
    (NUMBER (312., Some "€/an"))
    (Pos.value (lexstr "312 €/an")) ;
  [%test_eq: Tokens.t]
    (NUMBER (1., Some "$ /employé /mois"))
    (Pos.value (lexstr "1 $ /employé /mois")) ;
  [%test_eq: Tokens.t] (NUMBER (10., Some "%")) (Pos.value (lexstr "10 %")) ;
  [%test_eq: Tokens.t]
    (NUMBER (42., Some "kW.h/an.personne"))
    (Pos.value (lexstr "42 kW.h/an.personne"))

let%test_unit "Lex string" =
  [%test_eq: Tokens.t] (STRING "abc") (Pos.value (lexstr "\"abc\"")) ;
  [%test_eq: Tokens.t] (STRING "1239") (Pos.value (lexstr "\"1239\"")) ;
  [%test_eq: Tokens.t] (STRING "✨€€") (Pos.value (lexstr "\'✨€€\'"))

let%test_unit "Lex Rule Name" =
  [%test_eq: Tokens.t] (RULE_NAME "rule_name") (Pos.value (lexstr "rule_name")) ;
  [%test_eq: Tokens.t] (RULE_NAME "rule name") (Pos.value (lexstr "rule name")) ;
  [%test_eq: Tokens.t] (RULE_NAME "rule « '$n+ame 12 mo#éè °")
    (Pos.value (lexstr "rule « '$n+ame 12 mo#éè °")) ;
  [%test_eq: Tokens.t] (RULE_NAME "rule oui da")
    (Pos.value (lexstr "rule oui da"))

let%test_unit "Lex Boolean" =
  [%test_eq: Tokens.t] (BOOLEAN true) (Pos.value (lexstr "oui")) ;
  [%test_eq: Tokens.t] (BOOLEAN false) (Pos.value (lexstr "non"))

let%test_unit "Lex EOF" = [%test_eq: Tokens.t] EOF (Pos.value (lexstr ""))

let%test_unit "Lex Expressions" =
  let tokens =
    lex (Pos.mk ~pos:Pos.dummy "12 € + 4.5€ * 10 % / règle") |> to_exn
  in
  [%test_eq: Tokens.t list]
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
  [%test_eq: Tokens.t list]
    (List.map ~f:Pos.value tokens)
    [ NUMBER (12., None)
    ; DOT
    ; RULE_NAME "az"
    ; DOT
    ; RULE_NAME "mo"
    ; DIV
    ; BOOLEAN true
    ; EOF ]
