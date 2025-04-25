open Ast
open Tokens

let%test_unit "Parse 12 + 4.5" =
  [%test_eq: Ast.t]
    (Parser.parse [ NUMBER (12., None); ADD; NUMBER (4.5, None) ])
    (BinaryOp (Add, Const (Number (12., None)), Const (Number (4.5, None))))

let%test_unit "Parse 12 + 4.5 / 3" =
  [%test_eq: Ast.t]
    (Parser.parse
       [ NUMBER (12., None); ADD; NUMBER (4.5, None); DIV; NUMBER (3., None) ])
    (BinaryOp
       ( Add,
         Const (Number (12., None)),
         BinaryOp (Div, Const (Number (4.5, None)), Const (Number (3., None)))
       ))

let%test_unit "Parse a . b" =
  [%test_eq: Ast.t]
    (Parser.parse [ RULE_NAME "a"; DOT; RULE_NAME "b" ])
    (Ref [ "a"; "b" ])

let%test_unit "Parse a > 12 != b . c * 2 <= 0" =
  [%test_eq: Ast.t]
    (Parser.parse
       [
         RULE_NAME "a";
         GT;
         NUMBER (12., None);
         NEQ;
         RULE_NAME "b";
         DOT;
         RULE_NAME "c";
         MUL;
         NUMBER (2., None);
         LTE;
         NUMBER (0., None);
       ])
    (BinaryOp
       ( NotEq,
         BinaryOp (Gt, Ref [ "a" ], Const (Number (12., None))),
         BinaryOp
           ( LtEq,
             BinaryOp (Mul, Ref [ "b"; "c" ], Const (Number (2., None))),
             Const (Number (0., None)) ) ))

let%test_unit "Parse 12/01/2024 + 3 mois <= contrat salarié . date de démission"
    =
  [%test_eq: Ast.t]
    (Parser.parse
       [
         DATE_LITERAL (`Day (12, 1, 2024));
         ADD;
         NUMBER (3., Some "mois");
         LTE;
         RULE_NAME "contrat salarié";
         DOT;
         RULE_NAME "date de démission";
       ])
    (BinaryOp
       ( LtEq,
         BinaryOp
           ( Add,
             Const (Date (Day { day = 12; month = 1; year = 2024 })),
             Const (Number (3., Some (Units.parse_unit "mois"))) ),
         Ref [ "contrat salarié"; "date de démission" ] ))

let%test_unit "Parse -(3 * -a)" =
  [%test_eq: Ast.t]
    (Parser.parse
       [ SUB; LPAREN; NUMBER (3., None); MUL; SUB; RULE_NAME "a"; RPAREN ])
    (UnaryOp
       ( Neg,
         BinaryOp (Mul, Const (Number (3., None)), UnaryOp (Neg, Ref [ "a" ]))
       ))

let%test_unit "Parse (10 + 5 ** 2) / b" =
  [%test_eq: Ast.t]
    (Parser.parse
       [
         LPAREN;
         NUMBER (10., None);
         ADD;
         NUMBER (5., None);
         POW;
         NUMBER (2., None);
         RPAREN;
         DIV;
         RULE_NAME "b";
       ])
    (BinaryOp
       ( Div,
         BinaryOp
           ( Add,
             Const (Number (10., None)),
             BinaryOp (Pow, Const (Number (5., None)), Const (Number (2., None)))
           ),
         Ref [ "b" ] ))
