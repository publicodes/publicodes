Should have error when replaces don't match:

  $ publicodes compile ./input -o - -t debug_eval_tree
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:9:5
    8 │    valeur: 'toto'
    9 │  c1: a1 = b1 # erreur: pas possible de comparer un [10] avec ['toto']
      │      ^^   ˘˘ est l'énum ['toto']
      │      │
      │      est l'énum [10.]
   10 │  
  
  error[E025]: unités non compatibles
      ╒══ ./input/rules.publicodes:12:11
   11 │  a2:
   12 │    valeur: 10 euros
      │            ^^^^^^^^ unité: euros
   13 │  b2: a2
   14 │  c2:
   15 │    remplace: a2
   16 │    valeur: 10 kg # erreur: pas possible de remplacer un 'euros' par 'kg'.
      │            ˘˘˘˘˘ unité: kg
   17 │  
  
  error[E025]: unités non compatibles
      ╒══ ./input/rules.publicodes:20:5
   19 │    valeur: 10 euros
   20 │  b3: a3
      │      ^^ unité: euros
   21 │  c3:
      ·  
   25 │    remplace: c3
   26 │    valeur: 30 kg # erreur: pas possible de remplacer un 'euros' par 'kg'
      │            ˘˘˘˘˘ unité: kg
   27 │  
  
  error[E025]: unités non compatibles
      ╒══ ./input/rules.publicodes:35:11
   34 │    remplace: a5
   35 │    valeur: 20
      │            ^^ unité: euros
   36 │  d5:
   37 │    valeur: c5 + 10 kg # erreur: impossible d'additionner des 'euros' avec des 'kg'.
      │                 ˘˘˘˘˘ unité: kg
   38 │  
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:42:10
   41 │    avec:
   42 │      num: 10
      │           ^^ est le nombre 10.
   43 │  
      ·  
   50 │      replace num with text typed def:
   51 │        type: texte
      │        ˘˘˘˘ est un texte
   52 │        remplace:
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:42:10
   41 │    avec:
   42 │      num: 10
      │           ^^ est le nombre 10.
   43 │  
      ·  
   47 │          exclusif: oui
   48 │        valeur: "toto"
      │                ˘˘˘˘˘˘ est le texte "toto"
   49 │  
  
  [123]
