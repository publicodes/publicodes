open Yaml_parser
open Utils.Output
open Parse
open Base
open Ast

let p length any = Pos.(mk ~pos:(add ~len:length dummy)) any

let scalar (value : string) : scalar = ({value; style= `Plain}, Pos.dummy)

let value v = `Scalar (scalar v)

(* Tests for parse_rule_name *)
let%test_unit "parse: simple rule" =
  let output = parse ~filename:"test" (`O [(scalar "rule", value "42")]) in
  match result output with
  | Some [rule_def] ->
      [%test_eq: Shared.Rule_name.t] (Pos.value rule_def.name)
        (Shared.Rule_name.create_exn ["rule"]) ;
      [%test_eq: string list Shared.Shared_ast.value] rule_def.value
        { value= p 0 (Expr (p 2 (Const (Number (42., None)))))
        ; chainable_mechanisms= [] }
  | _ ->
      print_logs output ;
      assert false

let%test_unit "parse: simple rules" =
  let output =
    parse ~filename:"test"
      (`O [(scalar "rule 1", value "42"); (scalar "rule 2", value "non")])
  in
  match result output with
  | Some [rule_def1; rule_def2] ->
      [%test_eq: Shared.Rule_name.t] (Pos.value rule_def1.name)
        (Shared.Rule_name.create_exn ["rule 1"]) ;
      [%test_eq: string list Shared.Shared_ast.value] rule_def1.value
        { value= p 0 (Expr (p 2 (Const (Number (42., None)))))
        ; chainable_mechanisms= [] } ;
      [%test_eq: Shared.Rule_name.t] (Pos.value rule_def2.name)
        (Shared.Rule_name.create_exn ["rule 2"]) ;
      [%test_eq: string list Shared.Shared_ast.value] rule_def2.value
        {value= p 0 (Expr (p 3 (Const (Bool false)))); chainable_mechanisms= []}
  | _ ->
      print_logs output ;
      assert false

let%test_unit "parse: empty rule" =
  let output = parse ~filename:"test" (`O [(scalar "rule 1", value "")]) in
  match result output with
  | Some [rule_def] ->
      [%test_eq: Shared.Rule_name.t] (Pos.value rule_def.name)
        (Shared.Rule_name.create_exn ["rule 1"]) ;
      [%test_eq: string list Shared.Shared_ast.value] rule_def.value
        {value= p 0 Undefined; chainable_mechanisms= []}
  | _ ->
      print_logs output ;
      assert false

let%test_unit "parse: rules with title" =
  let output =
    parse ~filename:"test"
      (`O
         [ ( scalar "rule 1 . subrule 2"
           , `O [(scalar "titre", value "mon titre")] ) ] )
  in
  match result output with
  | Some [rule_def] ->
      [%test_eq: Shared.Rule_name.t] (Pos.value rule_def.name)
        (Shared.Rule_name.create_exn ["rule 1"; "subrule 2"]) ;

      [%test_eq: string list Shared.Shared_ast.value] rule_def.value
        {value= p 0 Undefined; chainable_mechanisms= []}
  | _ ->
      print_logs output ;
      assert false

let%test_unit "parse: rules with description and valeur" =
  let output =
    parse ~filename:"test"
      (`O
         [ ( scalar "rule"
           , `O
               [ (scalar "description", value "ma description")
               ; (scalar "valeur", value "rule 3") ] ) ] )
  in
  match result output with
  | Some [{ value; _}] ->
      [%test_eq: string list Shared.Shared_ast.value] value
        { value=
            p 0
              (Value
                 { value= p 0 (Expr (p 6 (Ref ["rule 3"])))
                 ; chainable_mechanisms= [] } )
        ; chainable_mechanisms= [] }
  | _ ->
      failwith "Expected no rule definitions"

(* Tests for chainable mechanisms *)
let%test_unit "parse: non applicable si" =
  let output =
    parse ~filename:"test"
      (`O
         [ ( scalar "rule"
           , `O
               [ (scalar "valeur", value "42")
               ; (scalar "non applicable si", value "condition") ] ) ] )
  in
  match result output with
  | Some [{value; _}] ->
      [%test_eq: string list Shared.Shared_ast.value] value
        { value=
            p 0
              (Value
                 { value= p 0 (Expr (p 2 (Const (Number (42., None)))))
                 ; chainable_mechanisms= [] } )
        ; chainable_mechanisms=
            [ p 0
                (Not_applicable_if
                   { value= p 0 (Expr (p 9 (Ref ["condition"])))
                   ; chainable_mechanisms= [] } ) ] }
  | _ ->
      print_logs output ;
      assert false

let%test_unit "parse: plafond" =
  let output =
    parse ~filename:"test"
      (`O
         [ ( scalar "rule"
           , `O [(scalar "valeur", value "42"); (scalar "plafond", value "1000")]
           ) ] )
  in
  match result output with
  | Some [{value; _}] ->
      [%test_eq: string list Shared.Shared_ast.value] value
        { value=
            p 0
              (Value
                 { value= p 0 (Expr (p 2 (Const (Number (42., None)))))
                 ; chainable_mechanisms= [] } )
        ; chainable_mechanisms=
            [ p 0
                (Ceiling
                   { value= p 0 (Expr (p 4 (Const (Number (1000., None)))))
                   ; chainable_mechanisms= [] } ) ] }
  | _ ->
      print_logs output ;
      assert false

let%test_unit "parse: multiple chainable mechanisms" =
  let output =
    parse ~filename:"test"
      (`O
         [ ( scalar "rule"
           , `O
               [ (scalar "valeur", value "42")
               ; (scalar "applicable si", value "condition")
               ; (scalar "plafond", value "1000")
               ; (scalar "plancher", value "10") ] ) ] )
  in
  match result output with
  | Some [{value; _}] ->
      [%test_eq: string list Shared.Shared_ast.value] value
        { value=
            p 0
              (Value
                 { value= p 0 (Expr (p 2 (Const (Number (42., None)))))
                 ; chainable_mechanisms= [] } )
        ; chainable_mechanisms=
            [ p 0
                (Applicable_if
                   { value= p 0 (Expr (p 9 (Ref ["condition"])))
                   ; chainable_mechanisms= [] } )
            ; p 0
                (Ceiling
                   { value= p 0 (Expr (p 4 (Const (Number (1000., None)))))
                   ; chainable_mechanisms= [] } )
            ; p 0
                (Floor
                   { value= p 0 (Expr (p 2 (Const (Number (10., None)))))
                   ; chainable_mechanisms= [] } ) ] }
  | _ ->
      print_logs output ;
      assert false
