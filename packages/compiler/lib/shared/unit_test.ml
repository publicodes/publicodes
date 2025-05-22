open Units
open Core

let%test_unit "€/an" =
  [%test_eq: Units.t] (parse_unit "€/an")
    (StrMap.of_alist_exn [("€", 1); ("an", -1)])

let%test_unit "kW.h/personne" =
  [%test_eq: Units.t]
    (parse_unit "kW.h/personne")
    (StrMap.of_alist_exn [("kW", 1); ("h", 1); ("personne", -1)])

let%test_unit "kW.h/panneau/m.m" =
  [%test_eq: Units.t]
    (parse_unit "kW.h/panneau/m.m")
    (StrMap.of_alist_exn [("kW", 1); ("h", 1); ("panneau", -1); ("m", -2)])

let%test_unit "equal %" =
  [%test_result: bool]
    (Units.equal (parse_unit "%") (parse_unit "%"))
    ~expect:true

let%test_unit "equal kg/m2" =
  [%test_result: bool]
    (Units.equal (parse_unit "kg/m2") (parse_unit "kg/m2"))
    ~expect:true

(* TODO
let%test_unit "m2" =
  [%test_eq: Units.t] (parse_unit "m2") (StrMap.of_alist_exn [ ("m", 2) ]) *)
