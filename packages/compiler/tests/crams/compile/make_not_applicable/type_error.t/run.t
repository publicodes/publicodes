Type error

  $ publicodes compile input -t debug_eval_tree -o -
  error[E023]: types non cohérents entre eux
      ╒══ input/rules.publicodes:2:24
    1 │  a:
    2 │    rend non applicable: b
      │                         ^ est n'importe quel booléan
    3 │    valeur: 6
      │            ˘ est le nombre 6.
    4 │  
  
  [123]
