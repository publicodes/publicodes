Should throw errors when the inferred type aren't a subset of the declared type:

  $ publicodes compile ./input/ -o -
  error[E040]: le symbole 'super' ne fait pas partie de l'énumération
      ╒══ ./input/rules.publicodes:14:7
   13 │      enum:
   14 │        type:
      │        ^^^^ est l'énum ['foo', 'bar', 'toot']
   15 │          une possibilité:
      │          ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'super']
   16 │            - 'foo'
  
  error[E040]: les symboles 'super', 'tata' ne font pas partie de l'énumération
      ╒══ ./input/rules.publicodes:28:7
   27 │      simple:
   28 │        type:
      │        ^^^^ est l'énum ['foo', 'bar', 'toot']
   29 │          une possibilité:
      │          ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['super', 'tata']
   30 │            - 'foo'
  
  error[E040]: le symbole 'toot' ne fait pas partie de l'énumération
      ╒══ ./input/rules.publicodes:41:7
   40 │      with replacement:
   41 │        type:
      │        ^^^^ est l'énum ['foo', 'bar']
   42 │          une possibilité:
      │          ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
   43 │            - 'foo'
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:60:11
   59 │    public: oui
   60 │    valeur: enum = 'bar'
      │            ^^^^   ˘˘˘˘˘ est le symbole 'bar'
      │            │
      │            est le symbole 'foo'
   61 │    contexte:
  
  [123]
