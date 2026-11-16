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
  warning[E027]: cycle de dépendance détecté
      ╒══ ./error/rules.publicodes:6:15
    2 │    valeur: 10% * salaire brut
    3 │    plafond: plafond
      │             ˘˘˘˘˘˘˘ règle 'cotisation . plafond' référencée ici
    4 │    avec:
    5 │      plafond:
    6 │        valeur: cotisation
      │                ˘˘˘˘˘˘˘˘˘˘ règle 'cotisation' référencée de nouveau
    7 │  
  
  warning[E027]: cycle de dépendance détecté
      ╒══ ./error/rules.publicodes:13:15
    9 │    valeur: 10% * salaire brut
   10 │    plafond: plafond bis
      │             ˘˘˘˘˘˘˘˘˘˘˘ règle 'cotisation bis . plafond bis' référencée ici
   11 │    avec:
   12 │      plafond bis:
   13 │        valeur: cotisation bis
      │                ˘˘˘˘˘˘˘˘˘˘˘˘˘˘ règle 'cotisation bis' référencée de nouveau
   14 │        contexte: # should fail while 'plafond bis' or 'cotisation bis' aren't defined in the contexte.
  
  warning[E027]: cycle de dépendance détecté
      ╒══ ./error/rules.publicodes:27:8
   22 │        valeur: 10% * b
   23 │        plafond: c
      │                 ˘ règle 'avec indirection . c' référencée ici
   24 │      c:
   25 │        valeur: d
      │                ˘ règle 'avec indirection . d' référencée ici
   26 │      b: 10000 €
   27 │      d: a
      │         ˘ règle 'avec indirection . a' référencée de nouveau
   28 │  
  
  warning[E027]: cycle de dépendance détecté
      ╒══ ./error/rules.publicodes:30:11
   29 │  auto-référencée:
   30 │    valeur: auto-référencée
      │            ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ la règle se référence elle-même
   31 │  
  
  warning[E027]: cycle de dépendance détecté
      ╒══ ./error/rules.publicodes:47:15
   35 │        valeur: 10
   36 │        plafond: plafond
      │                 ˘˘˘˘˘˘˘ règle 'avec remplacements . plafond bis' référencée ici
   37 │  
      ·  
   46 │        remplace: plafond
   47 │        valeur: cotisation
      │                ˘˘˘˘˘˘˘˘˘˘ règle 'avec remplacements . cotisation' référencée de nouveau
   48 │  
  
  warning[E027]: cycle de dépendance détecté
      ╒══ ./error/rules.publicodes:68:15
   52 │        valeur: 10
   53 │        plafond: plafond
      │                 ˘˘˘˘˘˘˘ règle 'avec remplacements transitifs . plafond bis' référencée ici
   54 │  
      ·  
   67 │        remplace: plafond bis proxy
   68 │        valeur: cotisation
      │                ˘˘˘˘˘˘˘˘˘˘ règle 'avec remplacements transitifs . cotisation' référencée de nouveau
   69 │  
  
  warning[E027]: cycle de dépendance détecté
      ╒══ ./error/rules.publicodes:87:15
   79 │        valeur: 10
   80 │        plafond: plafond
      │                 ˘˘˘˘˘˘˘ règle 'avec rend non applicable . plafond bis' référencée ici
   81 │  
   82 │      plafond: # should fail
   83 │        valeur: cotisation
      │                ˘˘˘˘˘˘˘˘˘˘ règle 'avec rend non applicable . cotisation' référencée ici
   84 │  
   85 │      plafond bis: # should fail
   86 │        rend non applicable: plafond
   87 │        valeur: plafond = 10
      │                ˘˘˘˘˘˘˘ règle 'avec rend non applicable . plafond' référencée de nouveau
   88 │  
  
  warning[E027]: cycle de dépendance détecté
      ╒══ ./error/rules.publicodes:83:15
   79 │        valeur: 10
   80 │        plafond: plafond
      │                 ˘˘˘˘˘˘˘ règle 'avec rend non applicable . plafond' référencée ici
   81 │  
   82 │      plafond: # should fail
   83 │        valeur: cotisation
      │                ˘˘˘˘˘˘˘˘˘˘ règle 'avec rend non applicable . cotisation' référencée de nouveau
   84 │  
  
  [123]

