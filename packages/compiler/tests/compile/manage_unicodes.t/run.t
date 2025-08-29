The compiler should correctly manage unicodes in the source code.

  $ publicodes compile input.publicodes -t debug_eval_tree -o -
  E021 cette règle n'existe pas [syntax error]
       ╒══  input.publicodes:1:7 ══
     1 │ test: réééégime
       │       ˘˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle `réééégime` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  E021 cette règle n'existe pas [syntax error]
       ╒══  input.publicodes:3:7 ══
     2 │
     3 │ test: regime
       │       ˘˘˘˘˘˘
   Hint: Ajoutez la règle `regime` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  {
    "evaluationTree": { "test": { "get": "test" } },
    "parameters": {},
    "types": {}
  }
  [123]
