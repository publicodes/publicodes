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
