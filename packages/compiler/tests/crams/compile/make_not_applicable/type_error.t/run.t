Type error

  $ publicodes compile input -t debug_eval_tree -o -
  
  E023 types non cohérents entre eux [type error]
       ╒══  input/rules.publicodes:2:24 ══
     1 │ a:
     2 │   rend non applicable: b
       │                        ˘ est n'importe quel booléan
       ╒══  input/rules.publicodes:3:11 ══
     2 │   rend non applicable: b
     3 │   valeur: 6
       │           ˘ est le nombre 6.
  
  [123]
