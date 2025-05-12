open Tokens
open Core
open Utils
open Shared.Shared_ast

let p any = Pos.mk Pos.dummy any

let with_no_pos = List.map ~f:(Pos.mk Pos.dummy)

let rule str_list = p @@ Ref str_list

let%test_unit "Parse 12 + 4.5" =
  [%test_eq: Ast.t]
    (Parser.parse @@ with_no_pos [NUMBER (12., None); ADD; NUMBER (4.5, None)])
    (p
       (BinaryOp
          (p Add, p (Const (Number (12., None))), p (Const (Number (4.5, None))))
       ) )

let%test_unit "Parse 12 + 4.5 / 3" =
  [%test_eq: Ast.t]
    ( Parser.parse
    @@ with_no_pos
         [NUMBER (12., None); ADD; NUMBER (4.5, None); DIV; NUMBER (3., None)]
    )
    (p
       (BinaryOp
          ( p Add
          , p (Const (Number (12., None)))
          , p
              (BinaryOp
                 ( p Div
                 , p (Const (Number (4.5, None)))
                 , p (Const (Number (3., None))) ) ) ) ) )

let%test_unit "Parse a . b" =
  [%test_eq: Ast.t]
    (Parser.parse @@ with_no_pos [RULE_NAME "a"; DOT; RULE_NAME "b"])
    (rule ["a"; "b"])

let%test_unit "Parse a > 12 != b . c * 2 <= 0" =
  [%test_eq: Ast.t]
    ( Parser.parse
    @@ with_no_pos
         [ RULE_NAME "a"
         ; GT
         ; NUMBER (12., None)
         ; NEQ
         ; RULE_NAME "b"
         ; DOT
         ; RULE_NAME "c"
         ; MUL
         ; NUMBER (2., None)
         ; LTE
         ; NUMBER (0., None) ] )
    (p
       (BinaryOp
          ( p NotEq
          , p (BinaryOp (p Gt, rule ["a"], p @@ Const (Number (12., None))))
          , p
              (BinaryOp
                 ( p LtEq
                 , p
                     (BinaryOp
                        (p Mul, rule ["b"; "c"], p @@ Const (Number (2., None)))
                     )
                 , p @@ Const (Number (0., None)) ) ) ) ) )

let%test_unit "Parse 12/01/2024 + 3 mois <= contrat salarié . date de démission"
    =
  [%test_eq: Ast.t]
    ( Parser.parse
    @@ with_no_pos
         [ DATE_LITERAL (`Day (12, 1, 2024))
         ; ADD
         ; NUMBER (3., Some "mois")
         ; LTE
         ; RULE_NAME "contrat salarié"
         ; DOT
         ; RULE_NAME "date de démission" ] )
    (p
       (BinaryOp
          ( p LtEq
          , p
              (BinaryOp
                 ( p Add
                 , p @@ Const (Date (Day {day= 12; month= 1; year= 2024}))
                 , p
                   @@ Const (Number (3., Some (Shared.Units.parse_unit "mois")))
                 ) )
          , rule ["contrat salarié"; "date de démission"] ) ) )

let%test_unit "Parse -(3 * -a)" =
  [%test_eq: Ast.t]
    ( Parser.parse
    @@ with_no_pos
         [SUB; LPAREN; NUMBER (3., None); MUL; SUB; RULE_NAME "a"; RPAREN] )
    (p
       (UnaryOp
          ( p Neg
          , p
              (BinaryOp
                 ( p Mul
                 , p @@ Const (Number (3., None))
                 , p @@ UnaryOp (p Neg, rule ["a"]) ) ) ) ) )

let%test_unit "Parse (10 + 5 ** 2) / b" =
  [%test_eq: Ast.t]
    ( Parser.parse
    @@ with_no_pos
         [ LPAREN
         ; NUMBER (10., None)
         ; ADD
         ; NUMBER (5., None)
         ; POW
         ; NUMBER (2., None)
         ; RPAREN
         ; DIV
         ; RULE_NAME "b" ] )
    (p
       (BinaryOp
          ( p Div
          , p
              (BinaryOp
                 ( p Add
                 , p @@ Const (Number (10., None))
                 , p
                     (BinaryOp
                        ( p Pow
                        , p @@ Const (Number (5., None))
                        , p @@ Const (Number (2., None)) ) ) ) )
          , rule ["b"] ) ) )
