open Core
open Dotted_name

let%test_unit "parent of dotted name" =
  (* Test empty list *)
  [%test_eq: string list option] (parent []) None ;
  (* Test single element *)
  [%test_eq: string list option] (parent ["a"]) None ;
  (* Test two elements *)
  [%test_eq: string list option] (parent ["a"; "b"]) (Some ["a"]) ;
  (* Test three elements *)
  [%test_eq: string list option] (parent ["a"; "b"; "c"]) (Some ["a"; "b"])
