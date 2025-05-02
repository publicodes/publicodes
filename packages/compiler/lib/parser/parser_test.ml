open Core
open Ast
open Expr.Ast
open Yaml_parser
open Utils.Output
open Parse

let scalar (value : string) : scalar = ({value; style= `Plain}, With_pos.dummy)

let value v = `Scalar (scalar v)

let obj (members : (string * yaml) list) : yaml =
  `O (List.map members ~f:(fun (key, value) -> (scalar key, value)))

(* Tests for parse_rule_name *)
let%test_unit "parse: simple rule" =
  let output = parse ~filename:"test" (obj [("rule", value "42")]) in
  match result output with
  | Some [rule_def] ->
      [%test_eq: string list] (With_pos.value rule_def.name) ["rule"] ;
      [%test_eq: rule_value] rule_def.value (Expr (Const (Number (42., None))))
  | _ ->
      print_logs output ;
      assert false

let%test_unit "parse: simple rules" =
  let output =
    parse ~filename:"test"
      (obj [("rule 1", value "42"); ("rule 2", value "non")])
  in
  match result output with
  | Some [rule_def1; rule_def2] ->
      [%test_eq: string list] (With_pos.value rule_def1.name) ["rule 1"] ;
      [%test_eq: rule_value] rule_def1.value (Expr (Const (Number (42., None)))) ;
      [%test_eq: string list] (With_pos.value rule_def2.name) ["rule 2"] ;
      [%test_eq: rule_value] rule_def2.value (Expr (Const (Bool false)))
  | _ ->
      print_logs output ;
      assert false

let%test_unit "parse: empty rule" =
  let output = parse ~filename:"test" (obj [("rule 1", value "")]) in
  match result output with
  | Some [rule_def] ->
      [%test_eq: string list] (With_pos.value rule_def.name) ["rule 1"] ;
      [%test_eq: rule_value] rule_def.value Undefined
  | _ ->
      print_logs output ;
      assert false

let%test_unit "parse: rules with title" =
  let output =
    parse ~filename:"test"
      (obj [("rule 1 . subrule 2", obj [("titre", value "mon titre")])])
  in
  match result output with
  | Some [rule_def] ->
      [%test_eq: string list]
        (With_pos.value rule_def.name)
        ["rule 1"; "subrule 2"] ;
      [%test_eq: rule_meta list] rule_def.meta [Title "mon titre"] ;
      [%test_eq: rule_value] rule_def.value Undefined
  | _ ->
      print_logs output ;
      assert false

let%test_unit "parse: rules with description and valeur" =
  let output =
    parse ~filename:"test"
      (obj
         [ ( "rule"
           , obj
               [ ("description", value "ma description")
               ; ("valeur", value "rule 3") ] ) ] )
  in
  match result output with
  | Some [{meta; value; _}] ->
      [%test_eq: rule_meta list] meta [Description "ma description"] ;
      [%test_eq: rule_value] value (Expr (Ref ["rule 3"]))
  | _ ->
      failwith "Expected no rule definitions"
