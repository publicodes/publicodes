Should return a type error when context usage is inconsistent:
  $ publicodes compile ./input/ -o - 
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:5:10
    4 │    contexte:
    5 │      ref: 4 euros
      │      ˘˘˘  ^^^^^^^ attendu `le booléan oui`, trouvé `le nombre 4.`
      │      │
      │      valeur renseignée pour cette règle incorrecte
    6 │    avec:
    7 │      ref:
    8 │        public: oui
    9 │        valeur: oui
      │                ˘˘˘ le type de la règle est défini ici
   10 │  
  
  error[E025]: unités non compatibles
      ╒══ ./input/rules.publicodes:22:5
   19 │          contexte:
   20 │            ref: 2 euro
      │                 ˘˘˘˘˘˘ unité: euro
   21 │    avec:
   22 │      ref:
      │      ˘˘˘ unité: euros
   23 │        public: oui
  
  [123]
