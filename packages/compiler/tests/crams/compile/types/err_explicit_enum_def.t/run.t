Should throw errors when the inferred type aren't a subset of the declared type:

  $ publicodes compile ./input/ -o -
  error[E040]: le symbole 'super' ne fait pas partie de l'énumération
      ╒══ ./input/rules.publicodes:19:7
   13 │      enum:
   14 │        type:
      │        ˘˘˘˘ est l'énum ['foo', 'super']
   15 │          une possibilité:
      ·  
   18 │            - 'toot'
   19 │        variations:
      │        ˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
   20 │          - si: 20 = 50
  
  error[E040]: les symboles 'super', 'tata' ne font pas partie de l'énumération
      ╒══ ./input/rules.publicodes:34:9
   27 │      simple:
   28 │        type:
      │        ˘˘˘˘ est l'énum ['super', 'tata']
   29 │          une possibilité:
      ·  
   33 │        valeur:
   34 │          variations:
      │          ˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
   35 │            - si: 20 = 50
  
  error[E040]: le symbole 'toot' ne fait pas partie de l'énumération
      ╒══ ./input/rules.publicodes:46:9
   40 │      with replacement:
   41 │        type:
      │        ˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
   42 │          une possibilité:
      ·  
   45 │        valeur:
   46 │          variations:
      │          ˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar']
   47 │            - si: oui
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:60:16
   59 │    public: oui
   60 │    valeur: enum = 'bar'
      │            ˘˘˘˘ ^ ˘˘˘˘˘ est le symbole 'bar'
      │            │    │
      │            │    opération invalide
      │            est le symbole 'foo'
   61 │    contexte:
      = (aide) l'opération `=` s'applique uniquement sur des valeurs de même type
  
  [123]
