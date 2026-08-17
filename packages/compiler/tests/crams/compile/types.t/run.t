Working case:

  $ publicodes compile ok -o - -t debug_eval_tree
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  d:
    if (@a > 50.) = true
    then 'foo'
    else if (@a > 40.) = true
      then 'bar'
      else not_applicable
  
  e:
    get_context(e)
  
  f:
    if (20. = 50.) = true
    then 'foo'
    else if (20. > 50.) = true
      then 'bar'
      else not_applicable
  
  g:
    if true = true
    then @g . a
    else if true = true
      then @g . b
      else not_applicable
  
  g . a:
    'foo'
  
  g . b:
    'bar'
  
  h:
    if true = true
    then @h . a
    else if true = true
      then if @h . c != not_applicable
        then @h . c
        else @h . b
      else not_applicable
  
  h . a:
    'foo'
  
  h . b:
    'bar'
  
  h . c:
    'toot'
  
  i:
    if true = true
    then @i . a
    else if true = true
      then @i . b
      else if true = true
        then if true = true
          then @i . c
          else if true = true
            then @i . d
            else not_applicable
        else not_applicable
  
  i . a:
    'foo'
  
  i . b:
    'bar'
  
  i . c:
    'super'
  
  i . d:
    'toot'
  
  test a:
    @a = 42.
  
  test b:
    @b = Shared_ast.Day {day = 11; year = 2000; month = 1}
  
  test c:
    @c = "foo"
  
  test d:
    @d = 'foo'
  
  test e:
    @e = 'bar'
  
  test f:
    @f = 'toot'

Symbol checks:

  $ publicodes compile ./symbol/ -o - -t debug_eval_tree
  
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
       │    ˘˘˘˘˘˘ est le texte "Test"
       ╒══  ./errors/type_mismatch/rules.publicodes:5:4 ══
     4 │ 
     5 │ c: a > b
       │    ˘˘ est n'importe quel nombre
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./errors/type_mismatch/rules.publicodes:1:4 ══
     1 │ a: "Test"
       │    ˘˘˘˘˘˘ est le texte "Test"
       ╒══  ./errors/type_mismatch/rules.publicodes:9:4 ══
     8 │ 
     9 │ e: 'Test'
       │    ˘˘˘˘˘˘ est le symbole 'Test'
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./errors/type_mismatch/rules.publicodes:26:12 ══
    25 │   avec:
    26 │     super: 'super'
       │            ˘˘˘˘˘˘˘ est le symbole 'super'
       ╒══  ./errors/type_mismatch/rules.publicodes:27:11 ══
    26 │     super: 'super'
    27 │     bien: 'bien'
       │           ˘˘˘˘˘˘ est le symbole 'bien'
  
  
  E040
  le symbole 'super' ne fait pas partie de l'énumération [type
  error]
       ╒══  ./errors/type_mismatch/rules.publicodes:38:5 ══
    37 │   type:
    38 │     une possibilité:
       │     ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
       ╒══  ./errors/type_mismatch/rules.publicodes:39:9 ══
    38 │     une possibilité:
    39 │       - 'foo'
       │         ˘˘˘˘˘ avec le symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:40:9 ══
    39 │       - 'foo'
    40 │       - 'bar'
       │         ˘˘˘˘˘ avec le symbole 'bar'
       ╒══  ./errors/type_mismatch/rules.publicodes:41:9 ══
    40 │       - 'bar'
    41 │       - 'toot'
       │         ˘˘˘˘˘˘ avec le symbole 'toot'
       ╒══  ./errors/type_mismatch/rules.publicodes:42:3 ══
    41 │       - 'toot'
    42 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'super']
       ╒══  ./errors/type_mismatch/rules.publicodes:44:14 ══
    43 │     - si: 20 = 50
    44 │       alors: 'foo'
       │              ˘˘˘˘˘ avec le symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:46:14 ══
    45 │     - si: 20 > 50
    46 │       alors: 'super' # not part of "une possibilité"
       │              ˘˘˘˘˘˘˘˘ avec le symbole 'super'
  
  
  E040
  les symboles 'super', 'tata' ne font pas partie de l'énumération
  [type error]
       ╒══  ./errors/type_mismatch/rules.publicodes:51:5 ══
    50 │   type:
    51 │     une possibilité:
       │     ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
       ╒══  ./errors/type_mismatch/rules.publicodes:52:9 ══
    51 │     une possibilité:
    52 │       - 'foo'
       │         ˘˘˘˘˘ avec le symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:53:9 ══
    52 │       - 'foo'
    53 │       - 'bar'
       │         ˘˘˘˘˘ avec le symbole 'bar'
       ╒══  ./errors/type_mismatch/rules.publicodes:54:9 ══
    53 │       - 'bar'
    54 │       - 'toot'
       │         ˘˘˘˘˘˘ avec le symbole 'toot'
       ╒══  ./errors/type_mismatch/rules.publicodes:55:3 ══
    54 │       - 'toot'
    55 │   variations: # no intersection with "une possibilité"
       │   ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['super', 'tata']
       ╒══  ./errors/type_mismatch/rules.publicodes:57:14 ══
    56 │     - si: 20 = 50
    57 │       alors: 'super'
       │              ˘˘˘˘˘˘˘ avec le symbole 'super'
       ╒══  ./errors/type_mismatch/rules.publicodes:59:14 ══
    58 │     - si: 20 > 50
    59 │       alors: 'tata'
       │              ˘˘˘˘˘˘ avec le symbole 'tata'
  
  
  E040
  le symbole 'toot' ne fait pas partie de l'énumération [type
  error]
       ╒══  ./errors/type_mismatch/rules.publicodes:63:5 ══
    62 │   type:
    63 │     une possibilité:
       │     ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar']
       ╒══  ./errors/type_mismatch/rules.publicodes:64:9 ══
    63 │     une possibilité:
    64 │       - 'foo'
       │         ˘˘˘˘˘ avec le symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:65:9 ══
    64 │       - 'foo'
    65 │       - 'bar'
       │         ˘˘˘˘˘ avec le symbole 'bar'
       ╒══  ./errors/type_mismatch/rules.publicodes:72:3 ══
    71 │       remplace: m . b
    72 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
       ╒══  ./errors/type_mismatch/rules.publicodes:67:8 ══
    66 │   avec:
    67 │     a: 'foo'
       │        ˘˘˘˘˘ avec le symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:68:8 ══
    67 │     a: 'foo'
    68 │     b: 'bar'
       │        ˘˘˘˘˘ avec le symbole 'bar'
       ╒══  ./errors/type_mismatch/rules.publicodes:70:15 ══
    69 │     c:
    70 │       valeur: 'toot' # not part of "une possibilité"
       │               ˘˘˘˘˘˘˘ avec le symbole 'toot'
  
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
       ╒══  ./errors/missing_type/rules.publicodes:8:1 ══
     7 │ 
     8 │ résultat paramètre:
       │ ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         résultat:
           type: nombre

Should allow to specify type with `type` key:
(FIXME: should have better positions for the rule `c`)

  $ publicodes compile type_key -o -
  
  E023 types non cohérents entre eux [type error]
       ╒══  type_key/rules.publicodes:8:11 ══
     7 │ c:
     8 │   valeur: a > b
       │           ˘˘˘˘˘ est un booléan
       ╒══  type_key/rules.publicodes:9:9 ══
     8 │   valeur: a > b
     9 │   type: texte # erreur
       │         ˘˘˘˘˘˘ est un texte
  
  [123]
