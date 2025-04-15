open Units

let%test_unit "€/an" =
  [%test_eq: Units.t] (parse_unit "€/an")
    (StrMap.of_alist_exn [ ("€", 1); ("an", -1) ])

let%test_unit "kW.h/personne" =
  [%test_eq: Units.t]
    (parse_unit "kW.h/personne")
    (StrMap.of_alist_exn [ ("kW", 1); ("h", 1); ("personne", -1) ])
