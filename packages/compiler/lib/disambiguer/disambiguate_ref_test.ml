open Disambiguate_ref
open Core

let%test_unit "do not disambiguate complete reference" =
  let rules = RuleNameSet.of_list [ [ "rule 1" ]; [ "rule 2" ] ] in
  let current = [ "rule 1" ] in
  let ref = [ "rule 2" ] in
  [%test_eq: string list] (disambiguate_ref ~rules ~current ref) ref;

  let rules = RuleNameSet.of_list [ [ "a" ]; [ "a"; "b" ] ] in
  let current = [ "a" ] in
  let ref = [ "a"; "b" ] in
  [%test_eq: string list] (disambiguate_ref ~rules ~current ref) ref

let%test_unit "disambiguate child rule" =
  let rules = RuleNameSet.of_list [ [ "a" ]; [ "a"; "b" ] ] in
  let current = [ "a" ] in
  let ref = [ "b" ] in
  [%test_eq: string list] (disambiguate_ref ~rules ~current ref) [ "a"; "b" ];

  let rules = RuleNameSet.of_list [ [ "a" ]; [ "a"; "b"; "c" ] ] in
  let current = [ "a" ] in
  [%test_eq: string list]
    (disambiguate_ref ~rules ~current [ "b"; "c" ])
    [ "a"; "b"; "c" ]

let%test_unit "disambiguate parent rule" =
  let rules =
    RuleNameSet.of_list [ [ "a" ]; [ "a"; "b" ]; [ "a"; "b"; "c" ] ]
  in
  let current = [ "a"; "b"; "c" ] in
  let ref = [ "b" ] in
  [%test_eq: string list] (disambiguate_ref ~rules ~current ref) [ "a"; "b" ]

let%test_unit "disambiguate child rule first" =
  let rules =
    RuleNameSet.of_list [ [ "a" ]; [ "a"; "a" ]; [ "a"; "a"; "a" ] ]
  in
  let current = [ "a"; "a" ] in
  let ref = [ "a" ] in
  [%test_eq: string list]
    (disambiguate_ref ~rules ~current ref)
    [ "a"; "a"; "a" ]

let%test_unit "disambiguate parent rule first" =
  let rules = RuleNameSet.of_list [ [ "a" ]; [ "a"; "a" ] ] in
  let current = [ "a"; "a" ] in
  let ref = [ "a" ] in
  [%test_eq: string list] (disambiguate_ref ~rules ~current ref) [ "a" ]
