
Simple multiplication without unit :
  $ publicodes compile -o - -t debug_eval_tree simple-multiplication-without-unit
  a:
    5. €
  
  b:
    3. * @a
  
  c:
    @b + 4. $

Simple addition unit with unit :

  $ publicodes compile simple-addition
  E025 unités non compatibles [type error]
       ╒══  simple-addition/rules.publicodes:1:26 ══
     1 │ simple expression: 12€ + 5$
       │                          ˘˘ unité: $
       ╒══  simple-addition/rules.publicodes:1:20 ══
     1 │ simple expression: 12€ + 5$
       │                    ˘˘˘˘ unité: €
  
  E025 unités non compatibles [type error]
       ╒══  simple-addition/rules.publicodes:3:1 ══
     2 │ 
     3 │ rule 2:
       │ ˘˘˘˘˘˘˘ unité: €
       ╒══  simple-addition/rules.publicodes:6:9 ══
     5 │     - 4 €
     6 │     - -(4 kg/m)
       │         ˘˘˘˘˘˘˘ unité: kg/m
  
  [123]

Simple multiplication with unit :

  $ publicodes compile simple-multiplication
  E025 unités non compatibles [type error]
       ╒══  simple-multiplication/rules.publicodes:1:29 ══
     1 │ simple expression ko:  (5kg * 5€/kg) = 12$
       │                             ˘˘˘˘˘˘˘˘ unité: €
       ╒══  simple-multiplication/rules.publicodes:1:40 ══
     1 │ simple expression ko:  (5kg * 5€/kg) = 12$
       │                                        ˘˘˘ unité: $
  
  [123]

Unit inference :

  $ publicodes compile unit_inference
  E025 unités non compatibles [type error]
       ╒══  unit_inference/rules.publicodes:7:9 ══
     6 │ z:
     7 │ test: x + 9 mois # KO car z est inféré à "mois" et x à "€"
       │         ˘˘˘˘˘˘˘˘˘ unité: mois
       ╒══  unit_inference/rules.publicodes:4:6 ══
     3 │ 
     4 │ x: z * 4€/mois
       │      ˘˘˘˘˘˘˘˘˘ unité: €
  
  E025 unités non compatibles [type error]
       ╒══  unit_inference/rules.publicodes:2:6 ══
     1 │ a: 5€
     2 │ b: a + 4kg # KO
       │      ˘˘˘˘˘˘ unité: kg
       ╒══  unit_inference/rules.publicodes:1:4 ══
     1 │ a: 5€
       │    ˘˘ unité: €
  
  [123]

Unit with percent :

  $ publicodes compile percent
  E025 unités non compatibles [type error]
       ╒══  percent/rules.publicodes:14:12 ══
    13 │ # should have error
    14 │ e: 5%/an + 4€/an
       │            ˘˘˘˘˘ unité: €/an
       ╒══  percent/rules.publicodes:14:4 ══
    13 │ # should have error
    14 │ e: 5%/an + 4€/an
       │    ˘˘˘˘˘˘ unité: %/an
  
  [123]

Add unit information with `unité` mechanism :

  $ publicodes compile mechanism
  E025 unités non compatibles [type error]
       ╒══  mechanism/rules.publicodes:13:13 ══
    12 │ 
    13 │ test b: b + 4 € # KO
       │             ˘˘˘˘ unité: €
       ╒══  mechanism/rules.publicodes:11:9 ══
    10 │   valeur: 5
    11 │   unité:
       │          unité: aucune
  
  E025 unités non compatibles [type error]
       ╒══  mechanism/rules.publicodes:4:10 ══
     3 │   valeur: 5
     4 │   unité: '%'
       │          ˘˘˘ unité: %
       ╒══  mechanism/rules.publicodes:6:13 ══
     5 │ 
     6 │ test a: a > 4 € # KO
       │             ˘˘˘˘ unité: €
  
  E025 unités non compatibles [type error]
       ╒══  mechanism/rules.publicodes:30:10 ══
    29 │   valeur: d
    30 │   unité: kg # KO
       │          ˘˘˘ unité: kg
       ╒══  mechanism/rules.publicodes:27:10 ══
    26 │   valeur: d
    27 │   unité: €
       │          ˘ unité: €
  
  E025 unités non compatibles [type error]
       ╒══  mechanism/rules.publicodes:20:10 ══
    19 │   valeur: c
    20 │   unité: kg # KO
       │          ˘˘˘ unité: kg
       ╒══  mechanism/rules.publicodes:17:4 ══
    16 │ # Incompatible unit
    17 │ c: 12 €
       │    ˘˘˘˘ unité: €
  
  [123]


Infer composed `unit` with contexte :

  $ publicodes compile unit-inference-with-contexte
  E025 unités non compatibles [type error]
       ╒══  unit-inference-with-contexte/rules.publicodes:2:10 ══
     1 │ chiffre d'affaires:
     2 │   unité: €
       │          ˘ unité: €
       ╒══  unit-inference-with-contexte/rules.publicodes:1:1 ══
     1 │ chiffre d'affaires:
       │ ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ unité: jour.€
  
  [123]
