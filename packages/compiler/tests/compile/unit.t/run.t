Simple addition unit with unit :

  $ publicodes compile simple-addition.publicodes -o -
  E023 valeur simple attendue [syntax error]
       ╒══  simple-addition.publicodes:4:3 ══
     3 │ rule 2:
     4 │   somme:
       │   ˘˘˘˘˘˘
  
  E017 unités non compatibles [type error]
       ╒══  simple-addition.publicodes:1:26 ══
     1 │ simple expression: 12€ + 5$
       │                          ˘˘ unité: $
       ╒══  simple-addition.publicodes:1:20 ══
     1 │ simple expression: 12€ + 5$
       │                    ˘˘˘˘ unité: €
  
  E017 unités non compatibles [type error]
       ╒══  simple-addition.publicodes:6:9 ══
     5 │     - 4 €
     6 │     - -(4 kg/m)
       │         ˘˘˘˘˘˘˘ unité: kg/m
       ╒══  simple-addition.publicodes:5:7 ══
     4 │   somme:
     5 │     - 4 €
       │       ˘˘˘ unité: €
  
  {
    "evaluationTree": {
      "simple expression": [ [ 12.0 ], "+", [ 5.0 ] ],
      "rule 2": [ [ 4.0 ], "+", [ [ "-", [ 4.0 ] ], "+", [ 0.0 ] ] ],
      "b": [ [ 5.0 ], "+", [ 9.0 ] ]
    },
    "parameters": {},
    "types": {}
  }
  [123]

Simple multiplication with unit :

  $ publicodes compile simple-multiplication.publicodes -o -
  E017 unités non compatibles [type error]
       ╒══  simple-multiplication.publicodes:1:29 ══
     1 │ simple expression ko:  (5kg * 5€/kg) = 12$
       │                             ˘˘˘˘˘˘˘˘ unité: €
       ╒══  simple-multiplication.publicodes:1:40 ══
     1 │ simple expression ko:  (5kg * 5€/kg) = 12$
       │                                        ˘˘˘ unité: $
  
  {
    "evaluationTree": {
      "simple expression ko": [ [ [ 5.0 ], "*", [ 5.0 ] ], "=", [ 12.0 ] ],
      "simple expression ok": [ [ [ 5.0 ], "*", [ 5.0 ] ], "=", [ 12.0 ] ],
      "a": [ [ [ 4.0 ], "/", [ 5.0 ] ], "=", [ 7.0 ] ]
    },
    "parameters": {},
    "types": {}
  }
  [123]

Unit inference :

  $ publicodes compile unit_inference.publicodes -o -
  E017 unités non compatibles [type error]
       ╒══  unit_inference.publicodes:7:9 ══
     6 │ z:
     7 │ test: x + 9 mois # KO car z est inféré à "mois" et x à "€"
       │         ˘˘˘˘˘˘˘˘˘ unité: mois
       ╒══  unit_inference.publicodes:4:6 ══
     3 │ 
     4 │ x: z * 4€/mois
       │      ˘˘˘˘˘˘˘˘˘ unité: €
  
  E017 unités non compatibles [type error]
       ╒══  unit_inference.publicodes:2:6 ══
     1 │ a: 5€
     2 │ b: a + 4kg # KO
       │      ˘˘˘˘˘˘ unité: kg
       ╒══  unit_inference.publicodes:1:4 ══
     1 │ a: 5€
       │    ˘˘ unité: €
  
  {
    "evaluationTree": {
      "z": { "get": "z" },
      "test": [ "x", "+", [ 9.0 ] ],
      "y": [ "z", "+", [ 3.0 ] ],
      "x": [ [ "z", "*", [ 4.0 ] ], "*", [ [ 100.0 ], "**", [ 0.0 ] ] ],
      "b": [ "a", "+", [ 4.0 ] ],
      "a": [ 5.0 ]
    },
    "parameters": {},
    "types": {}
  }
  [123]

Unit with percent :

  $ publicodes compile percent.publicodes -o -
  E017 unités non compatibles [type error]
       ╒══  percent.publicodes:14:12 ══
    13 │ # should have error
    14 │ e: 5%/an + 4€/an
       │            ˘˘˘˘˘ unité: €/an
       ╒══  percent.publicodes:14:4 ══
    13 │ # should have error
    14 │ e: 5%/an + 4€/an
       │    ˘˘˘˘˘˘ unité: %/an
  
  {
    "evaluationTree": {
      "c": [ [ 5.0 ], "*", [ 5.0 ] ],
      "f": [ [ [ 5.0 ], "*", [ 4.0 ] ], "*", [ [ 100.0 ], "**", [ -1.0 ] ] ],
      "d": [ [ [ 4.0 ], "/", [ 85.0 ] ], "*", [ [ 100.0 ], "**", [ 1.0 ] ] ],
      "e": [ [ 5.0 ], "+", [ 4.0 ] ],
      "b": [ [ [ 10.0 ], "*", [ 50.0 ] ], "*", [ [ 100.0 ], "**", [ -1.0 ] ] ],
      "a": [ [ 5.0 ], "*", [ 15.0 ] ]
    },
    "parameters": {},
    "types": {}
  }
  [123]

Add unit information with `unité` mechanism :

  $ publicodes compile mechanism.publicodes -o -
  E017 unités non compatibles [type error]
       ╒══  mechanism.publicodes:13:13 ══
    12 │ 
    13 │ test b: b + 4 € # KO
       │             ˘˘˘˘ unité: €
       ╒══  mechanism.publicodes:11:9 ══
    10 │   valeur: 5
    11 │   unité:
       │          unité: aucune
  
  E017 unités non compatibles [type error]
       ╒══  mechanism.publicodes:4:10 ══
     3 │   valeur: 5
     4 │   unité: '%'
       │          ˘˘˘ unité: %
       ╒══  mechanism.publicodes:6:13 ══
     5 │ 
     6 │ test a: a > 4 € # KO
       │             ˘˘˘˘ unité: €
  
  E017 unités non compatibles [type error]
       ╒══  mechanism.publicodes:30:10 ══
    29 │   valeur: d
    30 │   unité: kg # KO
       │          ˘˘˘ unité: kg
       ╒══  mechanism.publicodes:27:10 ══
    26 │   valeur: d
    27 │   unité: €
       │          ˘ unité: €
  
  E017 unités non compatibles [type error]
       ╒══  mechanism.publicodes:20:10 ══
    19 │   valeur: c
    20 │   unité: kg # KO
       │          ˘˘˘ unité: kg
       ╒══  mechanism.publicodes:17:4 ══
    16 │ # Incompatible unit
    17 │ c: 12 €
       │    ˘˘˘˘ unité: €
  
  {
    "evaluationTree": {
      "test b": [ "b", "+", [ 4.0 ] ],
      "b": [ 5.0 ],
      "d 2": "d",
      "c": [ 12.0 ],
      "test a": [ "a", ">", [ 4.0 ] ],
      "d": [ 12.0 ],
      "test d": "d",
      "test c": "c",
      "a": [ 5.0 ]
    },
    "parameters": {},
    "types": {}
  }
  [123]
