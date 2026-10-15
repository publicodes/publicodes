Should throw errors when the inferred type aren't a subset of the declared type:

  $ publicodes compile ./input/ -o -
  
  E040
  le symbole 'super' ne fait pas partie de l'énumération [type
  error]
       ╒══  ./input/rules.publicodes:15:9 ══
    14 │       type:
    15 │         une possibilité:
       │         ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
       ╒══  ./input/rules.publicodes:16:13 ══
    15 │         une possibilité:
    16 │           - 'foo'
       │             ˘˘˘˘˘ avec le symbole 'foo'
       ╒══  ./input/rules.publicodes:17:13 ══
    16 │           - 'foo'
    17 │           - 'bar'
       │             ˘˘˘˘˘ avec le symbole 'bar'
       ╒══  ./input/rules.publicodes:18:13 ══
    17 │           - 'bar'
    18 │           - 'toot'
       │             ˘˘˘˘˘˘ avec le symbole 'toot'
       ╒══  ./input/rules.publicodes:19:7 ══
    18 │           - 'toot'
    19 │       variations:
       │       ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'super']
       ╒══  ./input/rules.publicodes:21:18 ══
    20 │         - si: 20 = 50
    21 │           alors: 'foo'
       │                  ˘˘˘˘˘ avec le symbole 'foo'
       ╒══  ./input/rules.publicodes:23:18 ══
    22 │         - si: 20 > 50
    23 │           alors: 'super' # error: 'super' is not part of "une possibilité"
       │                  ˘˘˘˘˘˘˘˘ avec le symbole 'super'
  
  
  E040
  les symboles 'super', 'tata' ne font pas partie de l'énumération
  [type error]
       ╒══  ./input/rules.publicodes:29:9 ══
    28 │       type:
    29 │         une possibilité:
       │         ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
       ╒══  ./input/rules.publicodes:30:13 ══
    29 │         une possibilité:
    30 │           - 'foo'
       │             ˘˘˘˘˘ avec le symbole 'foo'
       ╒══  ./input/rules.publicodes:31:13 ══
    30 │           - 'foo'
    31 │           - 'bar'
       │             ˘˘˘˘˘ avec le symbole 'bar'
       ╒══  ./input/rules.publicodes:32:13 ══
    31 │           - 'bar'
    32 │           - 'toot'
       │             ˘˘˘˘˘˘ avec le symbole 'toot'
       ╒══  ./input/rules.publicodes:34:9 ══
    33 │       valeur:
    34 │         variations:
       │         ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['super', 'tata']
       ╒══  ./input/rules.publicodes:36:20 ══
    35 │           - si: 20 = 50
    36 │             alors: 'super'
       │                    ˘˘˘˘˘˘˘ avec le symbole 'super'
       ╒══  ./input/rules.publicodes:38:20 ══
    37 │           - si: 20 > 50
    38 │             alors: 'tata'
       │                    ˘˘˘˘˘˘ avec le symbole 'tata'
  
  
  E040
  le symbole 'toot' ne fait pas partie de l'énumération [type
  error]
       ╒══  ./input/rules.publicodes:42:9 ══
    41 │       type:
    42 │         une possibilité:
       │         ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar']
       ╒══  ./input/rules.publicodes:43:13 ══
    42 │         une possibilité:
    43 │           - 'foo'
       │             ˘˘˘˘˘ avec le symbole 'foo'
       ╒══  ./input/rules.publicodes:44:13 ══
    43 │           - 'foo'
    44 │           - 'bar'
       │             ˘˘˘˘˘ avec le symbole 'bar'
       ╒══  ./input/rules.publicodes:46:9 ══
    45 │       valeur:
    46 │         variations:
       │         ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
       ╒══  ./input/rules.publicodes:52:12 ══
    51 │       avec:
    52 │         a: 'foo'
       │            ˘˘˘˘˘ avec le symbole 'foo'
       ╒══  ./input/rules.publicodes:53:12 ══
    52 │         a: 'foo'
    53 │         b: 'bar'
       │            ˘˘˘˘˘ avec le symbole 'bar'
       ╒══  ./input/rules.publicodes:55:19 ══
    54 │         c:
    55 │           valeur: 'toot'
       │                   ˘˘˘˘˘˘ avec le symbole 'toot'
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./input/rules.publicodes:60:18 ══
    59 │   public: oui
    60 │   valeur: enum = 'bar'
       │                  ˘˘˘˘˘ est le symbole 'bar'
       ╒══  ./input/rules.publicodes:62:11 ══
    61 │   contexte:
    62 │     enum: 'foo'
       │           ˘˘˘˘˘ est le symbole 'foo'
  
  [123]
