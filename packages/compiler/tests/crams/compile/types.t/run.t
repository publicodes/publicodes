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
       ╒══  ./errors/type_mismatch/rules.publicodes:3:4 ══
     2 │ 
     3 │ b: 12
       │    ˘˘ est le nombre 12.
  
  
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

Should have error when replaces don't match:

  $ publicodes compile ./errors/replaces/ -o - -t debug_eval_tree
  
  E040
  le symbole 'toto' ne fait pas partie de l'énumération [type
  error]
       ╒══  ./errors/replaces/rules.publicodes:9:5 ══
     8 │   valeur: 'toto'
     9 │ c1: a1 = b1 # erreur: pas possible de comparer un [10] avec ['toto']
       │     ˘˘˘ est l'énum [10.]
       ╒══  ./errors/replaces/rules.publicodes:5:11 ══
     4 │   remplace: a1
     5 │   valeur: 10
       │           ˘˘ avec le nombre 10.
       ╒══  ./errors/replaces/rules.publicodes:9:10 ══
     8 │   valeur: 'toto'
     9 │ c1: a1 = b1 # erreur: pas possible de comparer un [10] avec ['toto']
       │          ˘˘˘ est l'énum ['toto']
       ╒══  ./errors/replaces/rules.publicodes:8:11 ══
     7 │   remplace: b1
     8 │   valeur: 'toto'
       │           ˘˘˘˘˘˘ avec le symbole 'toto'
  
  
  E025 unités non compatibles [type error]
       ╒══  ./errors/replaces/rules.publicodes:12:11 ══
    11 │ a2:
    12 │   valeur: 10 euros
       │           ˘˘˘˘˘˘˘˘ unité: euros
       ╒══  ./errors/replaces/rules.publicodes:16:11 ══
    15 │   remplace: a2
    16 │   valeur: 10 kg # erreur: pas possible de remplacer un 'euros' par 'kg'.
       │           ˘˘˘˘˘˘ unité: kg
  
  
  E025 unités non compatibles [type error]
       ╒══  ./errors/replaces/rules.publicodes:20:5 ══
    19 │   valeur: 10 euros
    20 │ b3: a3
       │     ˘˘ unité: euros
       ╒══  ./errors/replaces/rules.publicodes:26:11 ══
    25 │   remplace: c3
    26 │   valeur: 30 kg # erreur: pas possible de remplacer un 'euros' par 'kg'
       │           ˘˘˘˘˘˘ unité: kg
  
  
  E025 unités non compatibles [type error]
       ╒══  ./errors/replaces/rules.publicodes:35:11 ══
    34 │   remplace: a5
    35 │   valeur: 20
       │           ˘˘ unité: euros
       ╒══  ./errors/replaces/rules.publicodes:37:16 ══
    36 │ d5:
    37 │   valeur: c5 + 10 kg # erreur: impossible d'additionner des 'euros' avec des 'kg'.
       │                ˘˘˘˘˘˘ unité: kg
  
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
       ╒══  ./errors/missing_type/rules.publicodes:6:11 ══
     5 │   public: oui
     6 │   valeur: résultat paramètre
       │           ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         résultat:
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

Should allow to specify type with `type` key:
(FIXME: should have better positions for the rule `c`)

  $ publicodes compile ./type_annotation/ -o -
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./type_annotation/rules.publicodes:8:11 ══
     7 │ c:
     8 │   valeur: a > b
       │           ˘˘˘˘˘ est un booléan
       ╒══  ./type_annotation/rules.publicodes:9:9 ══
     8 │   valeur: a > b
     9 │   type: texte # erreur
       │         ˘˘˘˘˘˘ est un texte
  
  [123]

Should generalize the least precise side:

  $ publicodes compile generalization -o - | ../../scripts/get_rule_types.awk
  'a1':
    value: number
    type: "number",
    unit: "euros",
  'a2':
    value: boolean
    type: "boolean",
  'a3':
    value: text
    type: "text",
  'a4':
    value: ('tutu'|'toto')
    type: "symbol",
  'a5':
    value: date
    type: "date",
  'a6':
    value: ('foo'|'bar')
    type: "symbol",

Replaces should cause enumerations:

  $ publicodes compile enumerations -o - | ../../scripts/get_rule_types.awk
  
  E024
  information de type manquante pour ce résultat [type warning]
       ╒══  enumerations/rules.publicodes:38:5 ══
    37 │       valeur: c
    38 │     c: # type unknown
       │     ˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         same rule replaced with different types . c:
           type: nombre
  'simple replacement . a':
    value: (10.000000|20.000000)
    type: "number",
    unit: "euros",
  'simple replacement . c':
    value: 20.000000
    type: "number",
    unit: "euros",
  'simple variation':
    value: (30.000000|20.000000|10.000000)
    type: "number",
    unit: "aucune",
  'by default':
    value: (20.000000|10.000000)
    type: "number",
    unit: "aucune",
  'same rule replaced with different types . a':
    value: "foo"
    type: "text",
  'same rule replaced with different types . b':
    value: 42.000000
    type: "number",
    unit: "aucune",
  'generalization of an enum . simple literal':
    value: 1.000000
    type: "number",
    unit: "aucune",
  'generalization of an enum . sum':
    value: number
    type: "number",
    unit: "aucune",
  'same rule replaced with different types . c':
    value: unknown
    type: "unknown",

Should correctly infer types from context usage:
  $ publicodes compile ./context/ok -o - | ../../scripts/get_rule_types.awk
  'simple ok':
    value: 4.000000
    type: "number",
    unit: "euros",
  'simple ok . ref':
    value: number
    type: "number",
    unit: "euros",
  'nested ok':
    value: number
    type: "number",
    unit: "euros",
  'nested ok . ref':
    value: number
    type: "number",
    unit: "euros",


Should return a type error when context usage is inconsistent:
  $ publicodes compile ./context/error -o - | ../../scripts/get_rule_types.awk
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./context/error/main.publicodes:5:10 ══
     4 │   contexte:
     5 │     ref: 4 euros
       │          ˘˘˘˘˘˘˘ est le nombre 4.
       ╒══  ./context/error/main.publicodes:9:15 ══
     8 │       public: oui
     9 │       valeur: oui
       │               ˘˘˘ est le booléan oui
  
  
  E025 unités non compatibles [type error]
       ╒══  ./context/error/main.publicodes:20:16 ══
    19 │         contexte:
    20 │           ref: 2 euro
       │                ˘˘˘˘˘˘ unité: euro
       ╒══  ./context/error/main.publicodes:22:5 ══
    21 │   avec:
    22 │     ref:
       │     ˘˘˘˘ unité: euros
  
