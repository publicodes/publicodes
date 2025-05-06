open Units

let%test_unit "€/an" =
  [%test_eq: Units.t] (parse_unit "€/an")
    (StrMap.of_alist_exn [ ("€", 1); ("an", -1) ])

let%test_unit "kW.h/personne" =
  [%test_eq: Units.t]
    (parse_unit "kW.h/personne")
    (StrMap.of_alist_exn [ ("kW", 1); ("h", 1); ("personne", -1) ])

let%test_unit "kW.h/panneau/m.m" =
  [%test_eq: Units.t]
    (parse_unit "kW.h/panneau/m.m")
    (StrMap.of_alist_exn [ ("kW", 1); ("h", 1); ("panneau", -1); ("m", -2) ])
(* TODO
let%test_unit "m2" =
  [%test_eq: Units.t] (parse_unit "m2") (StrMap.of_alist_exn [ ("m", 2) ]) *)
