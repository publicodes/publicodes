Should throw errors when the inferred type aren't a subset of the declared type:

  $ publicodes compile ./input/ -o -
  error[E040]: le symbole 'super' ne fait pas partie de l'énumération
      ╒══ ./input/rules.publicodes:23:18
   14 │        type:
   15 │          une possibilité:
      │          ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
   16 │            - 'foo'
      │              ˘˘˘˘˘ avec le symbole 'foo'
   17 │            - 'bar'
      │              ˘˘˘˘˘ avec le symbole 'bar'
   18 │            - 'toot'
      │              ˘˘˘˘˘˘ avec le symbole 'toot'
   19 │        variations:
      │        ˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'super']
   20 │          - si: 20 = 50
   21 │            alors: 'foo'
      │                   ˘˘˘˘˘ avec le symbole 'foo'
   22 │          - si: 20 > 50
   23 │            alors: 'super' # error: 'super' is not part of "une possibilité"
      │                   ˘˘˘˘˘˘˘ avec le symbole 'super'
   24 │  
  
  error[E040]: les symboles 'super', 'tata' ne font pas partie de l'énumération
      ╒══ ./input/rules.publicodes:38:20
   28 │        type:
   29 │          une possibilité:
      │          ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
   30 │            - 'foo'
      │              ˘˘˘˘˘ avec le symbole 'foo'
   31 │            - 'bar'
      │              ˘˘˘˘˘ avec le symbole 'bar'
   32 │            - 'toot'
      │              ˘˘˘˘˘˘ avec le symbole 'toot'
   33 │        valeur:
   34 │          variations:
      │          ˘˘˘˘˘˘˘˘˘˘ est l'énum ['super', 'tata']
   35 │            - si: 20 = 50
   36 │              alors: 'super'
      │                     ˘˘˘˘˘˘˘ avec le symbole 'super'
   37 │            - si: 20 > 50
   38 │              alors: 'tata'
      │                     ˘˘˘˘˘˘ avec le symbole 'tata'
   39 │  
  
  error[E040]: le symbole 'toot' ne fait pas partie de l'énumération
      ╒══ ./input/rules.publicodes:55:19
   41 │        type:
   42 │          une possibilité:
      │          ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar']
   43 │            - 'foo'
      │              ˘˘˘˘˘ avec le symbole 'foo'
   44 │            - 'bar'
      │              ˘˘˘˘˘ avec le symbole 'bar'
   45 │        valeur:
   46 │          variations:
      │          ˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
   47 │            - si: oui
      ·  
   51 │        avec:
   52 │          a: 'foo'
      │             ˘˘˘˘˘ avec le symbole 'foo'
   53 │          b: 'bar'
      │             ˘˘˘˘˘ avec le symbole 'bar'
   54 │          c:
   55 │            valeur: 'toot'
      │                    ˘˘˘˘˘˘ avec le symbole 'toot'
   56 │            remplace: b
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:62:11
   59 │    public: oui
   60 │    valeur: enum = 'bar'
      │                   ˘˘˘˘˘ est le symbole 'bar'
   61 │    contexte:
   62 │      enum: 'foo'
      │            ˘˘˘˘˘ est le symbole 'foo'
   63 │    avec:
  
  [123]
