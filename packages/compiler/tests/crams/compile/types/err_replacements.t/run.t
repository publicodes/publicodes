Should have error when replaces don't match:

  $ publicodes compile ./input -o - -t debug_eval_tree
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:9:8
    8 │    valeur: 'toto'
    9 │  c1: a1 = b1 # erreur: pas possible de comparer un [10] avec ['toto']
      │      ˘˘ ^ ˘˘ est l'énum ['toto']
      │      │  │
      │      │  opération invalide
      │      est l'énum [10.]
   10 │  
      = (aide) l'opération `=` s'applique uniquement sur des valeurs de même type
  
  error[E025]: unités non compatibles
      ╒══ ./input/rules.publicodes:16:11
   11 │  a2:
   12 │    valeur: 10 euros
      │            ˘˘˘˘˘˘˘˘ unité: euros
   13 │  b2: a2
   14 │  c2:
   15 │    remplace: a2
   16 │    valeur: 10 kg # erreur: pas possible de remplacer un 'euros' par 'kg'.
      │            ˘˘˘˘˘ unité: kg
   17 │  
  
  error[E025]: unités non compatibles
      ╒══ ./input/rules.publicodes:26:11
   19 │    valeur: 10 euros
   20 │  b3: a3
      │      ˘˘ unité: euros
   21 │  c3:
      ·  
   25 │    remplace: c3
   26 │    valeur: 30 kg # erreur: pas possible de remplacer un 'euros' par 'kg'
      │            ˘˘˘˘˘ unité: kg
   27 │  
  
  error[E025]: unités non compatibles
      ╒══ ./input/rules.publicodes:37:16
   34 │    remplace: a5
   35 │    valeur: 20
      │            ˘˘ unité: euros
   36 │  d5:
   37 │    valeur: c5 + 10 kg # erreur: impossible d'additionner des 'euros' avec des 'kg'.
      │                 ˘˘˘˘˘ unité: kg
   38 │  
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:46:23
   41 │    avec:
   42 │      num: 10
      │      ˘˘˘ est le nombre 10.
   43 │  
   44 │      replace num with text:
      │      ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est le texte "toto"
   45 │        remplace:
   46 │          références à: num
      │                        ^^^ impossible de remplacer `le nombre 10.` par `le texte "toto"`
   47 │          exclusif: oui
      = (aide) il est uniquement possible de remplacer des valeurs de même types
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:53:23
   41 │    avec:
   42 │      num: 10
      │      ˘˘˘ est le nombre 10.
   43 │  
      ·  
   49 │  
   50 │      replace num with text typed def:
      │      ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est un texte
   51 │        type: texte
   52 │        remplace:
   53 │          références à: num
      │                        ^^^ impossible de remplacer `le nombre 10.` par `un texte`
   54 │          exclusif: oui
      = (aide) il est uniquement possible de remplacer des valeurs de même types
  
  [123]
