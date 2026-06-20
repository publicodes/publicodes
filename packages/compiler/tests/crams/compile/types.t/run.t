Working case:

  $ publicodes compile ok -o - -t debug_eval_tree
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  test a:
    @a = 42.
  
  test b:
    @b = Shared_ast.Day {day = 11; year = 2000; month = 1}
  
  test c:
    @c = "foo"

Symbol checks:

  $ publicodes compile ./symbol/ -o - -t debug_eval_tree
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./symbol/rules.publicodes:7:14 ══
     6 │     - si: oui
     7 │       alors: 'foo'
       │              ˘˘˘˘˘ est le symbole 'foo'
       ╒══  ./symbol/rules.publicodes:9:14 ══
     8 │     - si: non
     9 │       alors: 'bar'
       │              ˘˘˘˘˘ est le symbole 'bar'
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./symbol/rules.publicodes:1:4 ══
     1 │ a: 'foo'
       │    ˘˘˘˘˘ est le symbole 'foo'
       ╒══  ./symbol/rules.publicodes:3:8 ══
     2 │ b: a = 'foo' # ack
     3 │ c: a = 'bar' # nack
       │        ˘˘˘˘˘˘ est le symbole 'bar'
  
  [123]

Should have error when type don't match:

  $ publicodes compile ./errors/type_mismatch/ -o -
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./errors/type_mismatch/rules.publicodes:1:4 ══
     1 │ a: "Test"
       │    ˘˘˘˘˘˘ est un texte
       ╒══  ./errors/type_mismatch/rules.publicodes:3:4 ══
     2 │ 
     3 │ b: 12
       │    ˘˘ est un nombre
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./errors/type_mismatch/rules.publicodes:1:4 ══
     1 │ a: "Test"
       │    ˘˘˘˘˘˘ est un texte
       ╒══  ./errors/type_mismatch/rules.publicodes:9:4 ══
     8 │ 
     9 │ e: 'Test'
       │    ˘˘˘˘˘˘ est le symbole 'Test'
  
  [123]

Should correctly report missing type information for public rules:
(FIXME: should have better positions for the rule `résultat`)

  $ publicodes compile ./errors/missing_type/ 
  
  E024
  information de type manquante pour ce résultat [type warning]
       ╒══  ./errors/missing_type/rules.publicodes:1:1 ══
     1 │ paramètre seul: # manque l'information de type
       │ ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         paramètre seul:
           type: nombre
  
  E024
  information de type manquante pour ce résultat [type warning]
       ╒══  ./errors/missing_type/rules.publicodes:8:1 ══
     7 │ 
     8 │ résultat paramètre:
       │ ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         résultat paramètre:
           type: nombre
  
  E024
  information de type manquante pour ce résultat [type warning]
       ╒══  ./errors/missing_type/rules.publicodes:6:11 ══
     5 │   public: oui
     6 │   valeur: résultat paramètre
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         résultat:
           type: nombre

Should allow to specify type with `type` key:
(FIXME: should have better positions for the rule `c`)

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
