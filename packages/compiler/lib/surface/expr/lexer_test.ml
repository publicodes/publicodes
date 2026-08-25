open! Base
open Base
open Sedlexing
open Tokens
open Utils.Output
open Lexer
open Utils

let lexstr str = str |> Utf8.from_string |> lex_one

let%test_unit "Lex '+'" = [%test_eq: Tokens.t] ADD (Mark.remove (lexstr "+"))

let%test_unit "Lex '>='" = [%test_eq: Tokens.t] GTE (Mark.remove (lexstr ">="))

let%test_unit "Lex ' . '" = [%test_eq: Tokens.t] DOT (Mark.remove (lexstr " . "))

let%test_unit "Lex Date" =
  [%test_eq: Tokens.t]
    (DATE_LITERAL (`Day (31, 12, 2024)))
    (Mark.remove (lexstr "31/12/2024")) ;
  [%test_eq: Tokens.t]
    (DATE_LITERAL (`Month (12, 1998)))
    (Mark.remove (lexstr "12/1998"))

let%test_unit "Lex Number" =
  [%test_eq: Tokens.t] (NUMBER (1239., None)) (Mark.remove (lexstr "01239")) ;
  [%test_eq: Tokens.t] (NUMBER (12.098, None)) (Mark.remove (lexstr "12.098")) ;
  [%test_eq: Tokens.t] (NUMBER (12.8, Some "€")) (Mark.remove (lexstr "12.80€")) ;
  [%test_eq: Tokens.t] (NUMBER (42., Some "£")) (Mark.remove (lexstr "42 £")) ;
  [%test_eq: Tokens.t] (NUMBER (0.4, Some "%")) (Mark.remove (lexstr "0.4%")) ;
  [%test_eq: Tokens.t]
    (NUMBER (42., Some "% /an"))
    (Mark.remove (lexstr "42 % /an")) ;
  [%test_eq: Tokens.t]
    (NUMBER (312., Some "€/an"))
    (Mark.remove (lexstr "312 €/an")) ;
  [%test_eq: Tokens.t]
    (NUMBER (1., Some "$ /employé /mois"))
    (Mark.remove (lexstr "1 $ /employé /mois")) ;
  [%test_eq: Tokens.t] (NUMBER (10., Some "%")) (Mark.remove (lexstr "10 %")) ;
  [%test_eq: Tokens.t]
    (NUMBER (42., Some "kW.h/an.personne"))
    (Mark.remove (lexstr "42 kW.h/an.personne"))

let%test_unit "Lex string" =
  [%test_eq: Tokens.t] (STRING "abc") (Mark.remove (lexstr "\"abc\"")) ;
  [%test_eq: Tokens.t] (STRING "1239") (Mark.remove (lexstr "\"1239\""))

let%test_unit "Lex symbol" =
  [%test_eq: Tokens.t] (SYMBOL "abc") (Mark.remove (lexstr "'abc'")) ;
  [%test_eq: Tokens.t] (SYMBOL "1239") (Mark.remove (lexstr "'1239'"))

let%test_unit "Lex Rule Name" =
  [%test_eq: Tokens.t] (RULE_NAME "rule_name") (Mark.remove (lexstr "rule_name")) ;
  [%test_eq: Tokens.t] (RULE_NAME "rule name") (Mark.remove (lexstr "rule name")) ;
  [%test_eq: Tokens.t] (RULE_NAME "rule « '$n+ame 12 mo#éè °")
    (Mark.remove (lexstr "rule « '$n+ame 12 mo#éè °")) ;
  [%test_eq: Tokens.t] (RULE_NAME "rule oui da")
    (Mark.remove (lexstr "rule oui da"))

let%test_unit "Lex Boolean" =
  [%test_eq: Tokens.t] (BOOLEAN true) (Mark.remove (lexstr "oui")) ;
  [%test_eq: Tokens.t] (BOOLEAN false) (Mark.remove (lexstr "non"))

let%test_unit "Lex EOF" = [%test_eq: Tokens.t] EOF (Mark.remove (lexstr ""))

let%test_unit "Lex Expressions" =
  let tokens =
    lex (Mark.mk_pos ~pos:Pos.dummy "12 € + 4.5€ * 10 % / règle") |> to_exn
  in
  [%test_eq: Tokens.t list]
    (List.map ~f:Mark.remove tokens)
    [ NUMBER (12., Some "€")
    ; ADD
    ; NUMBER (4.5, Some "€")
    ; MUL
    ; NUMBER (10., Some "%")
    ; DIV
    ; RULE_NAME "règle"
    ; EOF ]

let%test_unit "Lex Expressions with" =
  let tokens = lex (Mark.mk_pos ~pos:Pos.dummy "12 . az . mo / oui") |> to_exn in
  [%test_eq: Tokens.t list]
    (List.map ~f:Mark.remove tokens)
    [ NUMBER (12., None)
    ; DOT
    ; RULE_NAME "az"
    ; DOT
    ; RULE_NAME "mo"
    ; DIV
    ; BOOLEAN true
    ; EOF ]
