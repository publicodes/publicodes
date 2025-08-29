Should have error when type don't match

  $ publicodes compile type_error.publicodes -o -
  E021 cette règle n'existe pas [syntax error]
       ╒══  type_error.publicodes:1:4 ══
     1 │ a: "Test"
       │    ˘˘˘˘˘
   Hint: Ajoutez la règle `Test` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  {
    "evaluationTree": {
      "c": [ "a", ">", "b" ],
      "b": [ 12.0 ],
      "a": { "get": "a" }
    },
    "parameters": {},
    "types": {}
  }
  [123]

Should allow to specify type with `type` key

  $ publicodes compile type_key.publicodes -o -
  E016 types non cohérents entre eux [type error]
       ╒══  type_key.publicodes:9:9 ══
     8 │   valeur: a > b
     9 │   type: texte # erreur
       │         ˘˘˘˘˘˘ est un texte
       ╒══  type_key.publicodes:8:13 ══
     7 │ c:
     8 │   valeur: a > b
       │             ˘˘˘ est un booléen (oui / non)
  
  {
    "evaluationTree": {
      "c": [ "a", ">", "b" ],
      "b": [ 12.0 ],
      "a": { "get": "a" }
    },
    "parameters": {},
    "types": {}
  }
  [123]
