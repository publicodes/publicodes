
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
  error[E025]: unités non compatibles
      ╒══ simple-addition/rules.publicodes:1:20
    1 │  simple expression: 12€ + 5$
      │                     ^^^   ˘˘ unité: $
      │                     │
      │                     unité: €
    2 │  
  
  error[E025]: unités non compatibles
      ╒══ simple-addition/rules.publicodes:5:7
    4 │    somme:
    5 │      - 4 €
      │        ^^^ unité: €
    6 │      - -(4 kg/m)
      │        ˘˘˘˘˘˘˘˘ unité: kg/m
    7 │  
  
  [123]

Simple multiplication with unit :

  $ publicodes compile simple-multiplication
  error[E025]: unités non compatibles
      ╒══ simple-multiplication/rules.publicodes:1:25
    1 │  simple expression ko:  (5kg * 5€/kg) = 12$
      │                          ^^^^^^^^^^^    ˘˘˘ unité: $
      │                          │
      │                          unité: €
    2 │  simple expression ok:  (5kg * 5€/kg) = 12€
  
  [123]

Unit inference :

  $ publicodes compile unit_inference
  error[E025]: unités non compatibles
      ╒══ unit_inference/rules.publicodes:1:4
    1 │  a: 5€
      │     ^^ unité: €
    2 │  b: a + 4kg # KO
      │         ˘˘˘ unité: kg
    3 │  
  
  error[E025]: unités non compatibles
      ╒══ unit_inference/rules.publicodes:4:4
    3 │  
    4 │  x: z * 4€/mois
      │     ^^^^^^^^^^^ unité: €
    5 │  y: z + 3 mois
    6 │  z:
    7 │  test: x + 9 mois # KO car z est inféré à "mois" et x à "€"
      │            ˘˘˘˘˘˘ unité: mois
    8 │  
  
  [123]

Unit with percent :

  $ publicodes compile -t debug_eval_tree -o - percent 
  a:
    5. % * 15.
  
  b:
    (10. % * 50. €) * 0.01
  
  c:
    5. %/étoile * 5. étoile
  
  d:
    (4. € / 85. %) * 100.
  
  simplification:
    get_context(simplification)
  
  simplification . inline:
    (5. % * 4. €) * 0.01
  
  simplification . mechanism:
    (5. % * 4. €) * 0.01

Unit with percent error:

  $ publicodes compile percent-error
  error[E025]: unités non compatibles
      ╒══ percent-error/rules.publicodes:3:4
    2 │  # should have error
    3 │  e: 5%/an + 4€/an
      │     ^^^^^   ˘˘˘˘˘ unité: €/an
      │     │
      │     unité: %/an
    4 │  
  
  [123]


Add unit information with `unité` mechanism :

  $ publicodes compile mechanism
  error[E025]: unités non compatibles
      ╒══ mechanism/rules.publicodes:4:10
    3 │    valeur: 5
    4 │    unité: '%'
      │           ^^^ unité: %
    5 │  
    6 │  test a: a > 4 € # KO
      │              ˘˘˘ unité: €
    7 │  
  
  error[E025]: unités non compatibles
      ╒══ mechanism/rules.publicodes:11:9
   10 │    valeur: 5
   11 │    unité:
      │          ^ unité: aucune
   12 │  
   13 │  test b: b + 4 € # KO
      │              ˘˘˘ unité: €
   14 │  
  
  error[E025]: unités non compatibles
      ╒══ mechanism/rules.publicodes:17:4
   16 │  # Incompatible unit
   17 │  c: 12 €
      │     ^^^^ unité: €
   18 │  test c:
   19 │    valeur: c
   20 │    unité: kg # KO
      │           ˘˘ unité: kg
   21 │  
  
  error[E025]: unités non compatibles
      ╒══ mechanism/rules.publicodes:24:4
   23 │  # Incompatible infered unit
   24 │  d: 12
      │     ^^ unité: €
   25 │  d 2:
      ·  
   29 │    valeur: d
   30 │    unité: kg # KO
      │           ˘˘ unité: kg
   31 │  
  
  [123]


Infer composed `unit` with contexte :

  $ publicodes compile unit-inference-with-contexte
  error[E025]: unités non compatibles
      ╒══ unit-inference-with-contexte/rules.publicodes:3:3
    2 │    unité: €
    3 │    produit:
      │    ^^^^^^^ unité: €/jour
    4 │      - TJM
      ·  
   40 │    contexte:
   41 │      chiffre d'affaires . TJM: 600 € # KO : should be €/jour
      │                                ˘˘˘˘˘ unité: €
   42 │  
  
  [123]
