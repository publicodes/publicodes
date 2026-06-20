Should works

  $ publicodes compile type_ok -o - -t debug_eval_tree
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  d:
    get_context(d)
  
  e:
    if (@a > 50.) = true
    then 'foo'
    else if (@a > 40.) = true
      then 'bar'
      else not_applicable
  
  f:
    get_context(f)
  
  g:
    if (20. = 50.) = true
    then 'foo'
    else if (20. > 50.) = true
      then 'tata'
      else not_applicable
  
  test a:
    @a = 42.
  
  test b:
    @b = Shared_ast.Day {day = 11; year = 2000; month = 1}
  
  test c:
    @c = "foo"
  
  test d:
    @d = 'foo'
  
  test e:
    @e = 'foo'
  
  test f:
    @f = 'bar'
  
  test g:
    @g = 'bar'

  $ publicodes compile type_error -o -
  
  E023 types non cohérents entre eux [type error]
       ╒══  type_error/rules.publicodes:38:5 ══
    37 │   type:
    38 │     une possibilité:
       │     ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
       ╒══  type_error/rules.publicodes:39:9 ══
    38 │     une possibilité:
    39 │       - 'foo'
       │         ˘˘˘˘˘ est le symbole 'foo'
       ╒══  type_error/rules.publicodes:40:9 ══
    39 │       - 'foo'
    40 │       - 'bar'
       │         ˘˘˘˘˘ est le symbole 'bar'
       ╒══  type_error/rules.publicodes:41:9 ══
    40 │       - 'bar'
    41 │       - 'toot'
       │         ˘˘˘˘˘˘ est le symbole 'toot'
       ╒══  type_error/rules.publicodes:47:13 ══
    46 │       alors: 'tata'
    47 │ test k: k = 'tata' # not part of "une possibilité"
       │             ˘˘˘˘˘˘˘ est le symbole 'tata'
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  type_error/rules.publicodes:1:4 ══
     1 │ a: "Test"
       │    ˘˘˘˘˘˘ est un texte
       ╒══  type_error/rules.publicodes:9:4 ══
     8 │ 
     9 │ e: 'Test'
       │    ˘˘˘˘˘˘ est le symbole 'Test'
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  type_error/rules.publicodes:26:12 ══
    25 │   avec:
    26 │     super: 'super'
       │            ˘˘˘˘˘˘˘ est le symbole 'super'
       ╒══  type_error/rules.publicodes:27:11 ══
    26 │     super: 'super'
    27 │     bien: 'bien'
       │           ˘˘˘˘˘˘ est le symbole 'bien'
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  type_error/rules.publicodes:14:3 ══
    13 │ g:
    14 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
       ╒══  type_error/rules.publicodes:16:14 ══
    15 │     - si: b > 50
    16 │       alors: 'foo'
       │              ˘˘˘˘˘ est le symbole 'foo'
       ╒══  type_error/rules.publicodes:18:14 ══
    17 │     - si: b > 40
    18 │       alors: 'bar'
       │              ˘˘˘˘˘ est le symbole 'bar'
       ╒══  type_error/rules.publicodes:20:14 ══
    19 │     - si: b > 40
    20 │       alors: 'toot'
       │              ˘˘˘˘˘˘ est le symbole 'toot'
       ╒══  type_error/rules.publicodes:21:8 ══
    20 │       alors: 'toot'
    21 │ h: g = 'nak' # not part of the enum
       │        ˘˘˘˘˘˘ est le symbole 'nak'
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  type_error/rules.publicodes:1:4 ══
     1 │ a: "Test"
       │    ˘˘˘˘˘˘ est un texte
       ╒══  type_error/rules.publicodes:3:4 ══
     2 │ 
     3 │ b: 12
       │    ˘˘ est un nombre
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  type_error/rules.publicodes:31:5 ══
    30 │   type:
    31 │     une possibilité:
       │     ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar']
       ╒══  type_error/rules.publicodes:32:9 ══
    31 │     une possibilité:
    32 │       - 'foo'
       │         ˘˘˘˘˘ est le symbole 'foo'
       ╒══  type_error/rules.publicodes:33:9 ══
    32 │       - 'foo'
    33 │       - 'bar'
       │         ˘˘˘˘˘ est le symbole 'bar'
       ╒══  type_error/rules.publicodes:34:13 ══
    33 │       - 'bar'
    34 │ test j: j = 'toot' # not part of "une possibilité"
       │             ˘˘˘˘˘˘˘ est le symbole 'toot'
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  type_error/rules.publicodes:51:5 ══
    50 │   type:
    51 │     une possibilité:
       │     ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
       ╒══  type_error/rules.publicodes:52:9 ══
    51 │     une possibilité:
    52 │       - 'foo'
       │         ˘˘˘˘˘ est le symbole 'foo'
       ╒══  type_error/rules.publicodes:53:9 ══
    52 │       - 'foo'
    53 │       - 'bar'
       │         ˘˘˘˘˘ est le symbole 'bar'
       ╒══  type_error/rules.publicodes:54:9 ══
    53 │       - 'bar'
    54 │       - 'toot'
       │         ˘˘˘˘˘˘ est le symbole 'toot'
       ╒══  type_error/rules.publicodes:55:3 ══
    54 │       - 'toot'
    55 │   variations: # no intersection with "une possibilité"
       │   ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['super', 'tata']
       ╒══  type_error/rules.publicodes:57:14 ══
    56 │     - si: 20 = 50
    57 │       alors: 'super'
       │              ˘˘˘˘˘˘˘ est le symbole 'super'
       ╒══  type_error/rules.publicodes:59:14 ══
    58 │     - si: 20 > 50
    59 │       alors: 'tata'
       │              ˘˘˘˘˘˘ est le symbole 'tata'
  
  [123]

Should allow to specify type with `type` key

  $ publicodes compile type_key -o -
  
  E023 types non cohérents entre eux [type error]
       ╒══  type_key/rules.publicodes:9:9 ══
     8 │   valeur: a > b
     9 │   type: texte # erreur
       │         ˘˘˘˘˘˘ est un texte
       ╒══  type_key/rules.publicodes:8:13 ══
     7 │ c:
     8 │   valeur: a > b
       │             ˘˘˘ est un booléen (oui / non)
  
  [123]
