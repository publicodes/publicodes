Test on real-world examples :

  $ publicodes compile auto-entrepreneur.publicodes -o -
  E019 règle parente manquante [syntax error]
       ╒══  auto-entrepreneur.publicodes:1:1 ══
     1 │ dirigeant . auto-entrepreneur:
       │ ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle parente `dirigeant`
         manquante
  
  {
    "evaluationTree": {
      "dirigeant . auto-entrepreneur . Cipav": [
        [],
        "||",
        [
          [
            [],
            "&&",
            [
              [],
              "&&",
              [
                [
                  "dirigeant . auto-entrepreneur . Cipav . adhérent", "=",
                  true
                ],
                "&&",
                true
              ]
            ]
          ],
          "||",
          false
        ]
      ],
      "dirigeant . auto-entrepreneur . Cipav . adhérent": {
        "if": [
          "∅", { "get": "dirigeant . auto-entrepreneur . Cipav . adhérent" }
        ],
        "then": false,
        "else": { "get": "dirigeant . auto-entrepreneur . Cipav . adhérent" }
      },
      "dirigeant . auto-entrepreneur . affiliation CIPAV": "dirigeant . auto-entrepreneur . Cipav",
      "dirigeant . auto-entrepreneur . Cipav . retraite complémentaire": [],
      "dirigeant . auto-entrepreneur . revenu net . après impôt": [],
      "dirigeant . auto-entrepreneur . revenu net": [],
      "dirigeant . auto-entrepreneur": {
        "if": [ "∅", [] ],
        "then": false,
        "else": []
      },
      "dirigeant . auto-entrepreneur . chiffre d'affaires": {
        "get": "dirigeant . auto-entrepreneur . chiffre d'affaires"
      },
      "dirigeant . auto-entrepreneur . éligible à l'ACRE": {
        "if": [ [ [], "=", false ], "||", [ "∅", [] ] ],
        "then": null,
        "else": {
          "if": [
            "∅",
            { "get": "dirigeant . auto-entrepreneur . éligible à l'ACRE" }
          ],
          "then": false,
          "else": {
            "get": "dirigeant . auto-entrepreneur . éligible à l'ACRE"
          }
        }
      }
    },
    "parameters": {},
    "types": {}
  }
  [123]
