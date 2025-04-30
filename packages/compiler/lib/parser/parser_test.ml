open Core
open Ast
open Expr.Ast
open Yaml_parser
open Parse

let scalar (value : string) : scalar =
  ({ value; style = `Plain }, With_pos.dummy)

let value v = `Scalar (scalar v)

let obj (members : (string * yaml) list) : yaml =
  `O (List.map members ~f:(fun (key, value) -> (scalar key, value)))

(* Tests for parse_rule_name *)
let%test_unit "parse: simple rule" =
  match parse (obj [ ("rule", value "42") ]) with
  | Ok [ rule_def ] ->
      [%test_eq: string list] rule_def.name [ "rule" ];
      [%test_eq: rule_value] rule_def.value (Expr (Const (Number (42., None))))
  | _ -> failwith "Expected a single rule definition"

let%test_unit "parse: simple rules" =
  match parse (obj [ ("rule 1", value "42"); ("rule 2", value "non") ]) with
  | Ok [ rule_def1; rule_def2 ] ->
      [%test_eq: string list] rule_def1.name [ "rule 1" ];
      [%test_eq: rule_value] rule_def1.value (Expr (Const (Number (42., None))));
      [%test_eq: string list] rule_def2.name [ "rule 2" ];
      [%test_eq: rule_value] rule_def2.value (Expr (Const (Bool false)))
  | _ -> failwith "Expected two rule definitions"

let%test_unit "parse: empty rule" =
  match parse (obj [ ("rule 1", value "") ]) with
  | Ok [ rule_def ] ->
      [%test_eq: string list] rule_def.name [ "rule 1" ];
      [%test_eq: rule_value] rule_def.value Undefined
  | _ -> failwith "Expected no rule definitions"

let%test_unit "parse: rules with title" =
  match
    parse (obj [ ("rule 1 . subrule 2", obj [ ("titre", value "mon titre") ]) ])
  with
  | Ok [ rule_def ] ->
      [%test_eq: string list] rule_def.name [ "rule 1"; "subrule 2" ];
      [%test_eq: rule_meta list] rule_def.meta [ Title "mon titre" ];
      [%test_eq: rule_value] rule_def.value Undefined
  | _ -> failwith "Expected no rule definitions"

let%test_unit "parse: rules with description and valeur" =
  match
    parse
      (obj
         [
           ( "rule",
             obj
               [
                 ("description", value "ma description");
                 ("valeur", value "rule 3");
               ] );
         ])
  with
  | Ok [ { meta; value; _ } ] ->
      [%test_eq: rule_meta list] meta [ Description "ma description" ];
      [%test_eq: rule_value] value (Expr (Ref [ "rule 3" ]))
  | _ -> failwith "Expected no rule definitions"
