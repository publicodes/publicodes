Test on real-world examples :

  $ publicodes compile auto-entrepreneur.publicodes -o -
  E023 valeur simple attendue [syntax error]
       ╒══  auto-entrepreneur.publicodes:51:3 ══
    50 │   résumé: Montant total des recettes (hors taxe)
    51 │   inversion numérique:
       │   ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
  
  E023 valeur simple attendue [syntax error]
       ╒══  auto-entrepreneur.publicodes:61:3 ══
    60 │   rend non applicable: entreprise . activités . revenus mixtes
    61 │   une de ces conditions:
       │   ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
  
  E023 valeur simple attendue [syntax error]
       ╒══  auto-entrepreneur.publicodes:67:3 ══
    66 │         - adhérent = oui
    67 │   avec:
       │   ˘˘˘˘˘
  
  E023 valeur simple attendue [syntax error]
       ╒══  auto-entrepreneur.publicodes:81:7 ══
    80 │         (SSI).
    81 │       références:
       │       ˘˘˘˘˘˘˘˘˘˘˘
  
  E023 valeur simple attendue [syntax error]
       ╒══  auto-entrepreneur.publicodes:101:3 ══
   100 │     ville (QPPV)
   101 │   références:
       │   ˘˘˘˘˘˘˘˘˘˘˘
  
  E020 règle parente manquante [syntax error]
       ╒══  auto-entrepreneur.publicodes:1:1 ══
     1 │ dirigeant . auto-entrepreneur:
       │ ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle parente `dirigeant`
         manquante
  E021 cette règle n'existe pas [syntax error]
       ╒══  auto-entrepreneur.publicodes:2:11 ══
     1 │ dirigeant . auto-entrepreneur:
     2 │   valeur: régime social = 'auto-entrepreneur'
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle `régime social` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  E021 cette règle n'existe pas [syntax error]
       ╒══  auto-entrepreneur.publicodes:20:11 ══
    19 │     paiement de l’impôt sur le revenu.
    20 │   valeur: entreprise . chiffre d'affaires - cotisations et contributions
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle `entreprise . chiffre
         d'affaires` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  E021 cette règle n'existe pas [syntax error]
       ╒══  auto-entrepreneur.publicodes:46:24 ══
    45 │     - etc...
    46 │   valeur: revenu net - rémunération . impôt
       │                        ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle `rémunération . impôt`
         manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  E021 cette règle n'existe pas [syntax error]
       ╒══  auto-entrepreneur.publicodes:62:7 ══
    61 │   une de ces conditions:
    62 │     - entreprise . activité . nature . libérale . réglementée
       │       ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle `entreprise . activité .
         nature . libérale . réglementée` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  E021 cette règle n'existe pas [syntax error]
       ╒══  auto-entrepreneur.publicodes:64:11 ══
    63 │     - toutes ces conditions:
    64 │         - entreprise . activité . nature = 'libérale'
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle `entreprise . activité .
         nature` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  E021 cette règle n'existe pas [syntax error]
       ╒══  auto-entrepreneur.publicodes:65:11 ══
    64 │         - entreprise . activité . nature = 'libérale'
    65 │         - entreprise . date de création < 01/2018
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle `entreprise . date de
         création` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  E021 cette règle n'existe pas [syntax error]
       ╒══  auto-entrepreneur.publicodes:86:11 ══
    85 │   description: Montant cotisé pour la retraite complémentaire.
    86 │   valeur: dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle `dirigeant . auto-entrepreneur
         . cotisations et contributions . cotisations . service BNC Cipav .
         répartition . retraite complémentaire` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  E021 cette règle n'existe pas [syntax error]
       ╒══  auto-entrepreneur.publicodes:91:18 ══
    90 │   question: Êtes-vous éligible à l’ACRE pour votre auto-entreprise ?
    91 │   applicable si: entreprise . durée d'activité . en début d'année < 1 an
       │                  ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle `entreprise . durée
         d'activité . en début d'année` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
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
