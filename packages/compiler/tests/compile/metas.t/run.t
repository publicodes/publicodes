Valid metas :

  $ publicodes compile valid-metas.publicodes  -o -
  {
    "evaluation": [ { "get": "a" }, 5.0 ],
    "outputs": {
      "a": {
        "parameters": { "a": null },
        "type": null,
        "nodeIndex": 0,
        "meta": { "description": null, "title": null, "notes": null }
      },
      "b": {
        "parameters": {},
        "type": { "number": true, "unit": "€" },
        "nodeIndex": 1,
        "meta": { "description": null, "title": null, "notes": null }
      }
    }
  }E024
  inStdlib.Formation de type manquante pour ce résultat [type
  warning]
       ╒══  valid-metas.publicodes:3:1 ══
     2 │ 
     3 │ a:
       │ ˘˘
   Hint: Spécifiez le type de la règle. Par exemple :
         `type: texte`
   Hint: a

Invalid metas :

  $ publicodes compile invalid-metas.publicodes  -o -
  {
    "evaluation": [ { "get": "a" }, { "get": "b" } ],
    "outputs": {
      "a": {
        "parameters": { "a": null },
        "type": null,
        "nodeIndex": 0,
        "meta": { "description": null, "title": null, "notes": null }
      },
      "b": {
        "parameters": { "b": null },
        "type": null,
        "nodeIndex": 1,
        "meta": { "description": null, "title": null, "notes": null }
      }
    }
  }E024
  inStdlib.Formation de type manquante pour ce résultat [type
  warning]
       ╒══  invalid-metas.publicodes:2:1 ══
     1 │ 
     2 │ a:
       │ ˘˘
   Hint: Spécifiez le type de la règle. Par exemple :
         `type: texte`
   Hint: a
  E024
  inStdlib.Formation de type manquante pour ce résultat [type
  warning]
       ╒══  invalid-metas.publicodes:7:1 ══
     6 │ 
     7 │ b:
       │ ˘˘
   Hint: Spécifiez le type de la règle. Par exemple :
         `type: texte`
   Hint: b
