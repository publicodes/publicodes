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
       ╒══  ./error/rules.publicodes:21:11 ══
    20 │ auto-référencée:
    21 │   valeur: auto-référencée
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ la règle se référence elle-même
  
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  ./error/rules.publicodes:6:15 ══
     5 │     plafond:
     6 │       valeur: cotisation
       │               ˘˘˘˘˘˘˘˘˘˘ règle 'cotisation' référencée ici
       ╒══  ./error/rules.publicodes:3:12 ══
     2 │   valeur: 10% * salaire brut
     3 │   plafond: plafond
       │            ˘˘˘˘˘˘˘ règle 'cotisation . plafond' référencée de nouveau
  
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  ./error/rules.publicodes:18:8 ══
    17 │     b: 10000 €
    18 │     d: a
       │        ˘ règle 'avec indirection . a' référencée ici
       ╒══  ./error/rules.publicodes:14:16 ══
    13 │       valeur: 10% * b
    14 │       plafond: c
       │                ˘ règle 'avec indirection . c' référencée ici
       ╒══  ./error/rules.publicodes:16:15 ══
    15 │     c:
    16 │       valeur: d
       │               ˘ règle 'avec indirection . d' référencée de nouveau
  
  [123]
