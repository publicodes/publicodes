Should return a type error when context usage is inconsistent:
  $ publicodes compile ./input/ -o - 
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:4:3
    3 │    valeur: ref
    4 │    contexte:
      │    ^^^^^^^^ est le booléan oui
    5 │      ref: 4 euros
      │           ˘˘˘˘˘˘˘ est le nombre 4.
    6 │    avec:
  
  error[E025]: unités non compatibles
      ╒══ ./input/rules.publicodes:20:16
   19 │          contexte:
   20 │            ref: 2 euro
      │                 ^^^^^^ unité: euro
   21 │    avec:
   22 │      ref:
      │      ˘˘˘ unité: euros
   23 │        public: oui
  
  [123]
