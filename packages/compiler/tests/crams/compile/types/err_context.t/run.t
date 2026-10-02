Should return a type error when context usage is inconsistent:
  $ publicodes compile ./input/ -o - 
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./input/rules.publicodes:5:10 ══
     4 │   contexte:
     5 │     ref: 4 euros
       │          ˘˘˘˘˘˘˘ est le nombre 4.
       ╒══  ./input/rules.publicodes:9:15 ══
     8 │       public: oui
     9 │       valeur: oui
       │               ˘˘˘ est le booléan oui
  
  
  E025 unités non compatibles [type error]
       ╒══  ./input/rules.publicodes:20:16 ══
    19 │         contexte:
    20 │           ref: 2 euro
       │                ˘˘˘˘˘˘ unité: euro
       ╒══  ./input/rules.publicodes:22:5 ══
    21 │   avec:
    22 │     ref:
       │     ˘˘˘˘ unité: euros
  
  [123]
