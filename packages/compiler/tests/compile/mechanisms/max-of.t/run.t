Bad types for arrondi :
  $ publicodes compile type_error.publicodes -t debug_eval_tree -o -
  E011 tableau attendu [syntax error]
       ╒══  type_error.publicodes:2:3 ══
     1 │ a:
     2 │   le maximum de: non
       │   ˘˘˘˘˘˘˘˘˘˘˘˘˘˘
  
  E014 valeur manquante [syntax error]
       ╒══  type_error.publicodes:12:6 ══
    11 │   le maximum de:
    12 │     -
       │       valeur attendue ici
  
  E025 unités non compatibles [type error]
       ╒══  type_error.publicodes:5:1 ══
     4 │ 
     5 │ b:
       │ ˘˘ unité: €
       ╒══  type_error.publicodes:8:7 ══
     7 │     - 5 €
     8 │     - 4 tomates
       │       ˘˘˘˘˘˘˘˘˘ unité: tomates
  
  [123]



Ok arrondi :
  $ publicodes compile ok.publicodes -t debug_eval_tree -o -
  a :
  4. max (3. max 5.)
  
  b :
  1.
  
  c :
  (1. max (2. max (3. € max (4. max (5. max (6. max (122. max (3. * 2.)))))))) max 5.
