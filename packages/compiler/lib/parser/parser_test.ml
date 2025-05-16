(* open Yaml_parser
open Utils.Output
open Parse
open Core
open Shared.Shared_ast
open Ast

let p ?(length = 0) any = Pos.(mk ~pos:(add ~len:length dummy)) any

let scalar (value : string) : scalar = ({value; style= `Plain}, Pos.dummy)

let value v = `Scalar (scalar v)

(* Tests for parse_rule_name *)
let%test_unit "parse: simple rule" =
  let output = parse ~filename:"test" (`O [(scalar "rule", value "42")]) in
  match result output with
  | Some [rule_def] ->
      [%test_eq: Shared.Rule_name.t] (Pos.value rule_def.name)
        (Shared.Rule_name.create_exn ["rule"]) ;
      [%test_eq: value] rule_def.value
        (p 2 (Expr (p 2 (Const (Number (42., None))))))
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
      [%test_eq: value] rule_def1.value
        (p 2 (Expr (p 2 (Const (Number (42., None)))))) ;
      [%test_eq: Shared.Rule_name.t] (Pos.value rule_def2.name)
        (Shared.Rule_name.create_exn ["rule 2"]) ;
      [%test_eq: value] rule_def2.value (p 3 (Expr (p 3 (Const (Bool false)))))
  | _ ->
      print_logs output ;
      assert false

let%test_unit "parse: empty rule" =
  let output = parse ~filename:"test" (`O [(scalar "rule 1", value "")]) in
  match result output with
  | Some [rule_def] ->
      [%test_eq: Shared.Rule_name.t] (Pos.value rule_def.name)
        (Shared.Rule_name.create_exn ["rule 1"]) ;
      [%test_eq: value] rule_def.value (p 0 Undefined)
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
      [%test_eq: rule_meta list] rule_def.meta [Title "mon titre"] ;
      [%test_eq: value_mechanism] rule_def.value.value (p 0 Undefined)
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
  | Some [{meta; value; _}] ->
      [%test_eq: rule_meta list] meta [Description "ma description"] ;
      [%test_eq: value] value (p 6 (Expr (p 6 (Ref ["rule 3"]))))
  | _ ->
      failwith "Expected no rule definitions" *)
