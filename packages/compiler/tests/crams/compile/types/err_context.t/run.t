Should return a type error when context usage is inconsistent:
  $ publicodes compile ./input/ -o - 
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:5:10
    4 │    contexte:
    5 │      ref: 4 euros
      │           ^^^^^^^ est le nombre 4.
    6 │    avec:
    7 │      ref:
    8 │        public: oui
    9 │        valeur: oui
      │                ˘˘˘ est le booléan oui
   10 │  
  
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
