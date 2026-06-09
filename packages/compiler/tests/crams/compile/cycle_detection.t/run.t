Cycle analysis should  be context-sensitive:
  $ publicodes compile ./ok/ -t debug_eval_tree -o -
  cotisation:
    if (@plafond != not_applicable) && (((10. % * @salaire brut) * 0.01) > @plafond)
    then @plafond
    else (10. % * @salaire brut) * 0.01
  
  plafond:
    with: {
      salaire brut = 1000. €
      plafond = 10.
    } in
    @cotisation
  
  salaire brut:
    10000. €

Without context, the cycle is detected:
  $ publicodes compile ./error/ -t debug_eval_tree -o -
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  ./error/rules.publicodes:6:15 ══
     5 │     plafond:
     6 │       valeur: cotisation
       │               ˘˘˘˘˘˘˘˘˘˘
   Hint: cotisation . plafond -> cotisation -> cotisation
         . plafond
  [123]
