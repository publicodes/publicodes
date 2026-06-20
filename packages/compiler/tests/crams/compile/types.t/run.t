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
       │         ˘˘˘˘˘ avec ce symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:40:9 ══
    39 │       - 'foo'
    40 │       - 'bar'
       │         ˘˘˘˘˘ avec ce symbole 'bar'
       ╒══  ./errors/type_mismatch/rules.publicodes:41:9 ══
    40 │       - 'bar'
    41 │       - 'toot'
       │         ˘˘˘˘˘˘ avec ce symbole 'toot'
       ╒══  ./errors/type_mismatch/rules.publicodes:42:3 ══
    41 │       - 'toot'
    42 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'super']
       ╒══  ./errors/type_mismatch/rules.publicodes:44:14 ══
    43 │     - si: 20 = 50
    44 │       alors: 'foo'
       │              ˘˘˘˘˘ avec ce symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:46:14 ══
    45 │     - si: 20 > 50
    46 │       alors: 'super' # not part of "une possibilité"
       │              ˘˘˘˘˘˘˘˘ avec ce symbole 'super'
  
  
  E040
  le symbole 'tata' ne fait pas partie de l'énumération [type
  error]
       ╒══  ./errors/type_mismatch/rules.publicodes:38:5 ══
    37 │   type:
    38 │     une possibilité:
       │     ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
       ╒══  ./errors/type_mismatch/rules.publicodes:39:9 ══
    38 │     une possibilité:
    39 │       - 'foo'
       │         ˘˘˘˘˘ avec ce symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:40:9 ══
    39 │       - 'foo'
    40 │       - 'bar'
       │         ˘˘˘˘˘ avec ce symbole 'bar'
       ╒══  ./errors/type_mismatch/rules.publicodes:41:9 ══
    40 │       - 'bar'
    41 │       - 'toot'
       │         ˘˘˘˘˘˘ avec ce symbole 'toot'
       ╒══  ./errors/type_mismatch/rules.publicodes:47:13 ══
    46 │       alors: 'super' # not part of "une possibilité"
    47 │ test k: k = 'tata' # not part of "une possibilité"
       │             ˘˘˘˘˘˘˘ est le symbole 'tata'
  
  
  E040
  le symbole 'nak' ne fait pas partie de l'énumération [type
  error]
       ╒══  ./errors/type_mismatch/rules.publicodes:14:3 ══
    13 │ g:
    14 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar', 'toot']
       ╒══  ./errors/type_mismatch/rules.publicodes:16:14 ══
    15 │     - si: b > 50
    16 │       alors: 'foo'
       │              ˘˘˘˘˘ avec ce symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:18:14 ══
    17 │     - si: b > 40
    18 │       alors: 'bar'
       │              ˘˘˘˘˘ avec ce symbole 'bar'
       ╒══  ./errors/type_mismatch/rules.publicodes:20:14 ══
    19 │     - si: b > 40
    20 │       alors: 'toot'
       │              ˘˘˘˘˘˘ avec ce symbole 'toot'
       ╒══  ./errors/type_mismatch/rules.publicodes:21:8 ══
    20 │       alors: 'toot'
    21 │ h: g = 'nak' # not part of the enum
       │        ˘˘˘˘˘˘ est le symbole 'nak'
  
  
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
       │         ˘˘˘˘˘ avec ce symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:65:9 ══
    64 │       - 'foo'
    65 │       - 'bar'
       │         ˘˘˘˘˘ avec ce symbole 'bar'
       ╒══  ./errors/type_mismatch/rules.publicodes:72:3 ══
    71 │       remplace: m . b
    72 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'toot', 'bar']
       ╒══  ./errors/type_mismatch/rules.publicodes:67:8 ══
    66 │   avec:
    67 │     a: 'foo'
       │        ˘˘˘˘˘ avec ce symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:70:15 ══
    69 │     c:
    70 │       valeur: 'toot' # not part of "une possibilité"
       │               ˘˘˘˘˘˘˘ avec ce symbole 'toot'
       ╒══  ./errors/type_mismatch/rules.publicodes:68:8 ══
    67 │     a: 'foo'
    68 │     b: 'bar'
       │        ˘˘˘˘˘ avec ce symbole 'bar'
  
  
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
       │         ˘˘˘˘˘ avec ce symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:53:9 ══
    52 │       - 'foo'
    53 │       - 'bar'
       │         ˘˘˘˘˘ avec ce symbole 'bar'
       ╒══  ./errors/type_mismatch/rules.publicodes:54:9 ══
    53 │       - 'bar'
    54 │       - 'toot'
       │         ˘˘˘˘˘˘ avec ce symbole 'toot'
       ╒══  ./errors/type_mismatch/rules.publicodes:55:3 ══
    54 │       - 'toot'
    55 │   variations: # no intersection with "une possibilité"
       │   ˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['super', 'tata']
       ╒══  ./errors/type_mismatch/rules.publicodes:57:14 ══
    56 │     - si: 20 = 50
    57 │       alors: 'super'
       │              ˘˘˘˘˘˘˘ avec ce symbole 'super'
       ╒══  ./errors/type_mismatch/rules.publicodes:59:14 ══
    58 │     - si: 20 > 50
    59 │       alors: 'tata'
       │              ˘˘˘˘˘˘ avec ce symbole 'tata'
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./errors/type_mismatch/rules.publicodes:1:4 ══
     1 │ a: "Test"
       │    ˘˘˘˘˘˘ est un texte
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
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./errors/type_mismatch/rules.publicodes:1:4 ══
     1 │ a: "Test"
       │    ˘˘˘˘˘˘ est un texte
       ╒══  ./errors/type_mismatch/rules.publicodes:3:4 ══
     2 │ 
     3 │ b: 12
       │    ˘˘ est un nombre
  
  
  E040
  le symbole 'toot' ne fait pas partie de l'énumération [type
  error]
       ╒══  ./errors/type_mismatch/rules.publicodes:31:5 ══
    30 │   type:
    31 │     une possibilité:
       │     ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ est l'énum ['foo', 'bar']
       ╒══  ./errors/type_mismatch/rules.publicodes:32:9 ══
    31 │     une possibilité:
    32 │       - 'foo'
       │         ˘˘˘˘˘ avec ce symbole 'foo'
       ╒══  ./errors/type_mismatch/rules.publicodes:33:9 ══
    32 │       - 'foo'
    33 │       - 'bar'
       │         ˘˘˘˘˘ avec ce symbole 'bar'
       ╒══  ./errors/type_mismatch/rules.publicodes:34:13 ══
    33 │       - 'bar'
    34 │ test j: j = 'toot' # not part of "une possibilité"
       │             ˘˘˘˘˘˘˘ est le symbole 'toot'
  
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
