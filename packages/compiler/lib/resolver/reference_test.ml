open Reference
open Core
open Common

let%test_unit "do not disambiguate complete reference" =
  let rules = Dotted_name.Set.of_list [ [ "rule 1" ]; [ "rule 2" ] ] in
  let current = [ "rule 1" ] in
  let ref = [ "rule 2" ] in
  [%test_eq: string list] (resolve ~rules ~current ref) ref;

  let rules = Dotted_name.Set.of_list [ [ "a" ]; [ "a"; "b" ] ] in
  let current = [ "a" ] in
  let ref = [ "a"; "b" ] in
  [%test_eq: string list] (resolve ~rules ~current ref) ref

let%test_unit "disambiguate child rule" =
  let rules = Dotted_name.Set.of_list [ [ "a" ]; [ "a"; "b" ] ] in
  let current = [ "a" ] in
  let ref = [ "b" ] in
  [%test_eq: string list] (resolve ~rules ~current ref) [ "a"; "b" ];

  let rules = Dotted_name.Set.of_list [ [ "a" ]; [ "a"; "b"; "c" ] ] in
  let current = [ "a" ] in
  [%test_eq: string list]
    (resolve ~rules ~current [ "b"; "c" ])
    [ "a"; "b"; "c" ]

let%test_unit "disambiguate parent rule" =
  let rules =
    Dotted_name.Set.of_list [ [ "a" ]; [ "a"; "b" ]; [ "a"; "b"; "c" ] ]
  in
  let current = [ "a"; "b"; "c" ] in
  let ref = [ "b" ] in
  [%test_eq: string list] (resolve ~rules ~current ref) [ "a"; "b" ]

let%test_unit "disambiguate child rule first" =
  let rules =
    Dotted_name.Set.of_list [ [ "a" ]; [ "a"; "a" ]; [ "a"; "a"; "a" ] ]
  in
  let current = [ "a"; "a" ] in
  let ref = [ "a" ] in
  [%test_eq: string list] (resolve ~rules ~current ref) [ "a"; "a"; "a" ]

let%test_unit "disambiguate current rule last" =
  let rules = Dotted_name.Set.of_list [ [ "a" ]; [ "a"; "a" ] ] in
  let current = [ "a"; "a" ] in
  let ref = [ "a" ] in
  [%test_eq: string list] (resolve ~rules ~current ref) [ "a" ]
