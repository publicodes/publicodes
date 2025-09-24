Valid metas :

  $ publicodes compile valid-metas.publicodes  -o -
  {
    "evaluation": [ 5.0 ],
    "outputs": {
      "a": {
        "parameters": {},
        "type": { "number": true, "unit": "aucune" },
        "nodeIndex": 0,
        "meta": {
          "title": "Mon titre",
          "description": "Voici une description.",
          "note": "Attention, cette règle est importante.\n"
        }
      },
      "b": {
        "parameters": {},
        "type": { "number": true, "unit": "€" },
        "nodeIndex": 0,
        "meta": {
          "title": "bla",
          "custom field": "true",
          "nested field": { "titre": "test" }
        }
      }
    }
  }


Invalid metas :

  $ publicodes compile invalid-metas.publicodes  -o -
  E017 mécanisme invalide [syntax error]
       ╒══  invalid-metas.publicodes:4:3 ══
     3 │   public: oui
     4 │   références:  # Invalid, put in a meta tag
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: La clé `références` n'est pas valide
   Hint: Utilisez la clé 'meta' pour ajouter des
         propriétés personnalisées à une règle
  E030 meta invalide [syntax error]
       ╒══  invalid-metas.publicodes:11:5 ══
    10 │   meta:
    11 │     titre: bla # Invalid, put at the root of the rule
       │     ˘˘˘˘˘˘ titre
   Hint: Cette méta doit être déplacée à la racine de
         la règle
  [123]
