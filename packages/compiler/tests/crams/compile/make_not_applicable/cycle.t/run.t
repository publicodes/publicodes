make not applicable with cycle :

  $ publicodes compile input -t debug_eval_tree -o -
  
  E029 cycle de remplacement détecté [cycle
  warning]
       ╒══  input/rules.publicodes:2:24 ══
     1 │ a:
     2 │   rend non applicable: b
       │                        ˘ règle 'b' référencée ici
       ╒══  input/rules.publicodes:5:24 ══
     4 │ b:
     5 │   rend non applicable: c
       │                        ˘ règle 'c' référencée ici
       ╒══  input/rules.publicodes:8:24 ══
     7 │ c:
     8 │   rend non applicable: a
       │                        ˘ règle 'a' référencée de nouveau
  
  [123]
