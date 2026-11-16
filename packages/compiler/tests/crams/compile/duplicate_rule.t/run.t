Les erreurs :

  $ publicodes compile duplicate -t debug_eval_tree -o -
  error[E037]: la règle `regle a` est définie plusieurs fois
      ╒══ duplicate/rules.publicodes:2:1
    1 │  regle a: 10
      │  ˘˘˘˘˘˘˘ définie ici
    2 │  regle a: 20
      │  ^^^^^^^ `regle a` est redéfinie ici
    3 │  
      = (aide) une règle ne peut être définie qu'une seule fois dans un module
  
  error[E037]: la règle `regle c . regle d` est définie plusieurs fois
      ╒══ duplicate/rules.publicodes:12:5
    8 │  
    9 │  regle c . regle d: 20
      │  ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ définie ici
   10 │  regle c:
   11 │    avec:
   12 │      regle d: 30
      │      ^^^^^^^ `regle c . regle d` est redéfinie ici
   13 │  
      = (aide) une règle ne peut être définie qu'une seule fois dans un module
  
  error[E037]: la règle `module b . regle b` est définie plusieurs fois
      ╒══ duplicate/rules.publicodes:7:5
    6 │    avec:
    7 │      regle b: 20
      │      ˘˘˘˘˘˘˘ définie ici
    8 │  
      ╒══ module b/rules.publicodes:1:1
    1 │  regle b:
      │  ^^^^^^^ `module b . regle b` est redéfinie ici
    2 │    valeur: 20
      = (aide) une règle ne peut être définie qu'une seule fois dans un module
  
  [123]

