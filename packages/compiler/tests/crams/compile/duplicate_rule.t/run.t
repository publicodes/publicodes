Les erreurs :

  $ publicodes compile duplicate -t debug_eval_tree -o -
  error[E037]: cette règle existe en double
      ╒══ duplicate/rules.publicodes:1:1
    1 │  regle a: 10
      │  ^^^^^^^ définie ici
    2 │  regle a: 20
      │  ˘˘˘˘˘˘˘ définie ici
    3 │  
      = La règle `regle a` est définie plusieurs fois
  
  error[E037]: cette règle existe en double
      ╒══ duplicate/rules.publicodes:7:5
    6 │    avec:
    7 │      regle b: 20
      │      ^^^^^^^ définie ici
    8 │  
      ╒══ module b/rules.publicodes:1:1
    1 │  regle b:
      │  ˘˘˘˘˘˘˘ définie ici
    2 │    valeur: 20
      = La règle `module b . regle b` est définie plusieurs fois
  
  error[E037]: cette règle existe en double
      ╒══ duplicate/rules.publicodes:9:1
    8 │  
    9 │  regle c . regle d: 20
      │  ^^^^^^^^^^^^^^^^^ définie ici
   10 │  regle c:
   11 │    avec:
   12 │      regle d: 30
      │      ˘˘˘˘˘˘˘ définie ici
   13 │  
      = La règle `regle c . regle d` est définie plusieurs fois
  
  [123]

