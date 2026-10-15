Should have error when replaces don't match:

  $ publicodes compile ./input -o - -t debug_eval_tree
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./input/rules.publicodes:9:5 ══
     8 │   valeur: 'toto'
     9 │ c1: a1 = b1 # erreur: pas possible de comparer un [10] avec ['toto']
       │     ˘˘˘ est l'énum [10.]
       ╒══  ./input/rules.publicodes:5:11 ══
     4 │   remplace: a1
     5 │   valeur: 10
       │           ˘˘ avec le nombre 10.
       ╒══  ./input/rules.publicodes:9:10 ══
     8 │   valeur: 'toto'
     9 │ c1: a1 = b1 # erreur: pas possible de comparer un [10] avec ['toto']
       │          ˘˘˘ est l'énum ['toto']
       ╒══  ./input/rules.publicodes:8:11 ══
     7 │   remplace: b1
     8 │   valeur: 'toto'
       │           ˘˘˘˘˘˘ avec le symbole 'toto'
  
  
  E025 unités non compatibles [type error]
       ╒══  ./input/rules.publicodes:12:11 ══
    11 │ a2:
    12 │   valeur: 10 euros
       │           ˘˘˘˘˘˘˘˘ unité: euros
       ╒══  ./input/rules.publicodes:16:11 ══
    15 │   remplace: a2
    16 │   valeur: 10 kg # erreur: pas possible de remplacer un 'euros' par 'kg'.
       │           ˘˘˘˘˘˘ unité: kg
  
  
  E025 unités non compatibles [type error]
       ╒══  ./input/rules.publicodes:20:5 ══
    19 │   valeur: 10 euros
    20 │ b3: a3
       │     ˘˘ unité: euros
       ╒══  ./input/rules.publicodes:26:11 ══
    25 │   remplace: c3
    26 │   valeur: 30 kg # erreur: pas possible de remplacer un 'euros' par 'kg'
       │           ˘˘˘˘˘˘ unité: kg
  
  
  E025 unités non compatibles [type error]
       ╒══  ./input/rules.publicodes:35:11 ══
    34 │   remplace: a5
    35 │   valeur: 20
       │           ˘˘ unité: euros
       ╒══  ./input/rules.publicodes:37:16 ══
    36 │ d5:
    37 │   valeur: c5 + 10 kg # erreur: impossible d'additionner des 'euros' avec des 'kg'.
       │                ˘˘˘˘˘˘ unité: kg
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./input/rules.publicodes:42:10 ══
    41 │   avec:
    42 │     num: 10
       │          ˘˘ est le nombre 10.
       ╒══  ./input/rules.publicodes:51:13 ══
    50 │     replace num with text typed def:
    51 │       type: texte
       │             ˘˘˘˘˘ est un texte
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./input/rules.publicodes:42:10 ══
    41 │   avec:
    42 │     num: 10
       │          ˘˘ est le nombre 10.
       ╒══  ./input/rules.publicodes:48:15 ══
    47 │         exclusif: oui
    48 │       valeur: "toto"
       │               ˘˘˘˘˘˘ est le texte "toto"
  
  [123]
