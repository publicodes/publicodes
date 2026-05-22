Les erreurs :

  $ publicodes compile duplicate -t debug_eval_tree -o -
  E037 cette règle existe en double [syntax error]
       ╒══  duplicate/rules.publicodes:1:1 ══
     1 │ regle a: 10
       │ ˘˘˘˘˘˘˘˘ définie ici
       ╒══  duplicate/rules.publicodes:2:1 ══
     1 │ regle a: 10
     2 │ regle a: 20
       │ ˘˘˘˘˘˘˘˘ définie ici
   Hint: La règle `regle a` est définie plusieurs
         fois
  E037 cette règle existe en double [syntax error]
       ╒══  duplicate/rules.publicodes:7:5 ══
     6 │   avec:
     7 │     regle b: 20
       │     ˘˘˘˘˘˘˘˘ définie ici
       ╒══  module b/rules.publicodes:1:1 ══
     1 │ regle b:
       │ ˘˘˘˘˘˘˘˘ définie ici
   Hint: La règle `module b . regle b` est définie
         plusieurs fois
  E037 cette règle existe en double [syntax error]
       ╒══  duplicate/rules.publicodes:9:1 ══
     8 │ 
     9 │ regle c . regle d: 20
       │ ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ définie ici
       ╒══  duplicate/rules.publicodes:12:5 ══
    11 │   avec:
    12 │     regle d: 30
       │     ˘˘˘˘˘˘˘˘ définie ici
   Hint: La règle `regle c . regle d` est définie
         plusieurs fois
  [123]

