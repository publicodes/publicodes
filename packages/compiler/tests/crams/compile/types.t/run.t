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

  $ publicodes compile type_error -o -
  
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
       ╒══  type_error/rules.publicodes:1:4 ══
     1 │ a: "Test"
       │    ˘˘˘˘˘˘ est un texte
       ╒══  type_error/rules.publicodes:9:4 ══
     8 │ 
     9 │ e: 'Test'
       │    ˘˘˘˘˘˘ est un symbole
  
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
