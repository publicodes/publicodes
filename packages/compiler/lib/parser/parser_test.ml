open Core
open Ast
open Expr.Ast
open Parse

(* Helper to create YAML values for testing *)
let scalar value =
  `Scalar
    Yaml.
      {
        value;
        anchor = None;
        tag = None;
        plain_implicit = true;
        quoted_implicit = false;
        style = `Plain;
      }

let mapping members =
  `O
    Yaml.
      {
        m_anchor = None;
        m_tag = None;
        m_implicit = true;
        m_members =
          List.map members ~f:(fun (key, value) -> (scalar key, value));
      }

(* Tests for parse_rule_name *)
let%test_unit "parse: simple rule" =
  match parse (mapping [ ("rule", scalar "42") ]) with
  | Ok [ rule_def ] ->
      [%test_eq: string list] rule_def.name [ "rule" ];
      [%test_eq: rule_value] rule_def.value (Expr (Const (Number (42., None))))
  | _ -> failwith "Expected a single rule definition"

let%test_unit "parse: simple rules" =
  match
    parse (mapping [ ("rule 1", scalar "42"); ("rule 2", scalar "non") ])
  with
  | Ok [ rule_def1; rule_def2 ] ->
      [%test_eq: string list] rule_def1.name [ "rule 1" ];
      [%test_eq: rule_value] rule_def1.value (Expr (Const (Number (42., None))));
      [%test_eq: string list] rule_def2.name [ "rule 2" ];
      [%test_eq: rule_value] rule_def2.value (Expr (Const (Bool false)))
  | _ -> failwith "Expected two rule definitions"

let%test_unit "parse: empty rule" =
  match parse (mapping [ ("rule 1", scalar "") ]) with
  | Ok [ rule_def ] ->
      [%test_eq: string list] rule_def.name [ "rule 1" ];
      [%test_eq: rule_value] rule_def.value Undefined
  | _ -> failwith "Expected no rule definitions"

let%test_unit "parse: rules with title" =
  match
    parse
      (mapping
         [ ("rule 1 . subrule 2", mapping [ ("titre", scalar "mon titre") ]) ])
  with
  | Ok [ rule_def ] ->
      [%test_eq: string list] rule_def.name [ "rule 1"; "subrule 2" ];
      [%test_eq: rule_meta list] rule_def.meta [ Title "mon titre" ];
      [%test_eq: rule_value] rule_def.value Undefined
  | _ -> failwith "Expected no rule definitions"

let%test_unit "parse: rules with description and valeur" =
  match
    parse
      (mapping
         [
           ( "rule",
             mapping
               [
                 ("description", scalar "ma description");
                 ("valeur", scalar "rule 3");
               ] );
         ])
  with
  | Ok [ { meta; value; _ } ] ->
      [%test_eq: rule_meta list] meta [ Description "ma description" ];
      [%test_eq: rule_value] value (Expr (Ref [ "rule 3" ]))
  | _ -> failwith "Expected no rule definitions"
