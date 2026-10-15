module SA = Shared.Shared_ast
open Tokens
open Base
open Utils
open Utils.Output
open Shared.Shared_ast

let pop any = Mark.mk_pos ~pos:Pos.dummy any

let p any = Mark.mk_pos ~pos:Pos.dummy any

let with_no_pos = List.map ~f:(Mark.mk_pos ~pos:Pos.dummy)

let rule str_list = p @@ Ref str_list

let parse tokens = tokens |> with_no_pos |> Parser.parse |> to_exn

let%test_unit "Parse 12 + 4.5 / 3" =
  [%test_eq: (string list, Mark.pos_mark) SA.expr]
    (parse
       [NUMBER (12., None); ADD; NUMBER (4.5, None); DIV; NUMBER (3., None)] )
    (p
       (Binary_op
          ( pop Add
          , p (Const (Number (12., None)))
          , p
              (Binary_op
                 ( pop Div
                 , p (Const (Number (4.5, None)))
                 , p (Const (Number (3., None))) ) ) ) ) )

let%test_unit "Parse a . b" =
  [%test_eq: (string list, Mark.pos_mark) SA.expr]
    (parse [RULE_NAME "a"; DOT; RULE_NAME "b"])
    (rule ["a"; "b"])

let%test_unit "Parse a > 12 != b . c * 2 <= 0" =
  [%test_eq: (string list, Mark.pos_mark) SA.expr]
    (parse
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
       (Binary_op
          ( pop NotEq
          , p (Binary_op (pop Gt, rule ["a"], p @@ Const (Number (12., None))))
          , p
              (Binary_op
                 ( pop LtEq
                 , p
                     (Binary_op
                        ( pop Mul
                        , rule ["b"; "c"]
                        , p @@ Const (Number (2., None)) ) )
                 , p @@ Const (Number (0., None)) ) ) ) ) )

let%test_unit "Parse 12/01/2024 + 3 mois <= contrat salarié . date de démission"
    =
  [%test_eq: (string list, Mark.pos_mark) SA.expr]
    (parse
       [ DATE_LITERAL (`Day (12, 1, 2024))
       ; ADD
       ; NUMBER (3., Some "mois")
       ; LTE
       ; RULE_NAME "contrat salarié"
       ; DOT
       ; RULE_NAME "date de démission" ] )
    (p
       (Binary_op
          ( pop LtEq
          , p
              (Binary_op
                 ( pop Add
                 , p @@ Const (Date (Day {day= 12; month= 1; year= 2024}))
                 , p
                   @@ Const (Number (3., Some (Shared.Units.parse_unit "mois")))
                 ) )
          , rule ["contrat salarié"; "date de démission"] ) ) )

let%test_unit "Parse -(3 * -a)" =
  [%test_eq: (string list, Mark.pos_mark) SA.expr]
    (parse [SUB; LPAREN; NUMBER (3., None); MUL; SUB; RULE_NAME "a"; RPAREN])
    (p
       (Unary_op
          ( pop Neg
          , p
              (Binary_op
                 ( pop Mul
                 , p @@ Const (Number (3., None))
                 , p @@ Unary_op (pop Neg, rule ["a"]) ) ) ) ) )

let%test_unit "Parse (10 + 5 ** 2) / b" =
  [%test_eq: (string list, Mark.pos_mark) SA.expr]
    (parse
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
       (Binary_op
          ( pop Div
          , p
              (Binary_op
                 ( pop Add
                 , p @@ Const (Number (10., None))
                 , p
                     (Binary_op
                        ( pop Pow
                        , p @@ Const (Number (5., None))
                        , p @@ Const (Number (2., None)) ) ) ) )
          , rule ["b"] ) ) )
