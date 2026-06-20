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
  
  test a:
    @a = 42.
  
  test b:
    @b = Shared_ast.Day {day = 11; year = 2000; month = 1}
  
  test c:
    @c = "foo"
  
  test d:
    @d = 'foo'

  $ publicodes compile type_error -o -
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
