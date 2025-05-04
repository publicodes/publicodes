open Ast
open Tokens
open Core
open Utils

let p any = Pos.mk Pos.dummy any

let with_no_pos = List.map ~f:(Pos.mk Pos.dummy)

let%test_unit "Parse 12 + 4.5" =
  [%test_eq: Ast.t]
    (Parser.parse @@ with_no_pos [NUMBER (12., None); ADD; NUMBER (4.5, None)])
    (BinaryOp
       (p Add, Const (p (Number (12., None))), Const (p (Number (4.5, None))))
    )

let%test_unit "Parse 12 + 4.5 / 3" =
  [%test_eq: Ast.t]
    ( Parser.parse
    @@ with_no_pos
         [NUMBER (12., None); ADD; NUMBER (4.5, None); DIV; NUMBER (3., None)]
    )
    (BinaryOp
       ( p Add
       , Const (p (Number (12., None)))
       , BinaryOp
           (p Div, Const (p (Number (4.5, None))), Const (p (Number (3., None))))
       ) )

let%test_unit "Parse a . b" =
  [%test_eq: Ast.t]
    (Parser.parse @@ with_no_pos [RULE_NAME "a"; DOT; RULE_NAME "b"])
    (Ref (p ["a"; "b"]))

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
    (BinaryOp
       ( p NotEq
       , BinaryOp (p Gt, Ref (p ["a"]), Const (p (Number (12., None))))
       , BinaryOp
           ( p LtEq
           , BinaryOp (p Mul, Ref (p ["b"; "c"]), Const (p (Number (2., None))))
           , Const (p (Number (0., None))) ) ) )

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
    (BinaryOp
       ( p LtEq
       , BinaryOp
           ( p Add
           , Const (p (Date (Day {day= 12; month= 1; year= 2024})))
           , Const (p (Number (3., Some (Units.parse_unit "mois")))) )
       , Ref (p ["contrat salarié"; "date de démission"]) ) )

let%test_unit "Parse -(3 * -a)" =
  [%test_eq: Ast.t]
    ( Parser.parse
    @@ with_no_pos
         [SUB; LPAREN; NUMBER (3., None); MUL; SUB; RULE_NAME "a"; RPAREN] )
    (UnaryOp
       ( p Neg
       , BinaryOp
           (p Mul, Const (p (Number (3., None))), UnaryOp (p Neg, Ref (p ["a"])))
       ) )

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
    (BinaryOp
       ( p Div
       , BinaryOp
           ( p Add
           , Const (p (Number (10., None)))
           , BinaryOp
               ( p Pow
               , Const (p (Number (5., None)))
               , Const (p (Number (2., None))) ) )
       , Ref (p ["b"]) ) )
