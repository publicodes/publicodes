make not applicable with cycle :

  $ publicodes compile input -t debug_eval_tree -o -
  warning[E029]: cycle de remplacement détecté
      ╒══ input/rules.publicodes:8:24
    1 │  a:
    2 │    rend non applicable: b
      │                         ˘ règle 'b' référencée ici
    3 │  
    4 │  b:
    5 │    rend non applicable: c
      │                         ˘ règle 'c' référencée ici
    6 │  
    7 │  c:
    8 │    rend non applicable: a
      │                         ˘ règle 'a' référencée de nouveau
    9 │  
  
  [123]
