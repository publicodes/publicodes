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
       ╒══  ./error/rules.publicodes:30:11 ══
    29 │ auto-référencée:
    30 │   valeur: auto-référencée
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ la règle se référence elle-même
  
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  ./error/rules.publicodes:10:12 ══
     9 │   valeur: 10% * salaire brut
    10 │   plafond: plafond bis
       │            ˘˘˘˘˘˘˘˘˘˘˘ règle 'cotisation bis . plafond bis' référencée ici
       ╒══  ./error/rules.publicodes:13:15 ══
    12 │     plafond bis:
    13 │       valeur: cotisation bis
       │               ˘˘˘˘˘˘˘˘˘˘˘˘˘˘ règle 'cotisation bis' référencée de nouveau
  
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  ./error/rules.publicodes:47:15 ══
    46 │       remplace: plafond
    47 │       valeur: cotisation
       │               ˘˘˘˘˘˘˘˘˘˘ règle 'avec remplacements . cotisation' référencée ici
       ╒══  ./error/rules.publicodes:36:16 ══
    35 │       valeur: 10
    36 │       plafond: plafond
       │                ˘˘˘˘˘˘˘ règle 'avec remplacements . plafond bis' référencée de nouveau
  
  
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
       ╒══  ./error/rules.publicodes:68:15 ══
    67 │       remplace: plafond bis proxy
    68 │       valeur: cotisation
       │               ˘˘˘˘˘˘˘˘˘˘ règle 'avec remplacements transitifs . cotisation' référencée ici
       ╒══  ./error/rules.publicodes:53:16 ══
    52 │       valeur: 10
    53 │       plafond: plafond
       │                ˘˘˘˘˘˘˘ règle 'avec remplacements transitifs . plafond bis' référencée de nouveau
  
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  ./error/rules.publicodes:27:8 ══
    26 │     b: 10000 €
    27 │     d: a
       │        ˘ règle 'avec indirection . a' référencée ici
       ╒══  ./error/rules.publicodes:23:16 ══
    22 │       valeur: 10% * b
    23 │       plafond: c
       │                ˘ règle 'avec indirection . c' référencée ici
       ╒══  ./error/rules.publicodes:25:15 ══
    24 │     c:
    25 │       valeur: d
       │               ˘ règle 'avec indirection . d' référencée de nouveau
  
  [123]

