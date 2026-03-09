Wrongly formatted variations :

  $ publicodes compile syntax_error.publicodes -t debug_eval_tree -o - -
  E017 mécanisme invalide [syntax error]
       ╒══  syntax_error.publicodes:5:7 ══
     4 │       alors: 200
     5 │       sinon: 300 #KO
       │       ˘˘˘˘˘˘
   Hint: La clé `sinon` n'est pas valide
  E017 mécanisme invalide [syntax error]
       ╒══  syntax_error.publicodes:8:3 ══
     7 │ b:
     8 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: Une variation doit contenir « si: » et «
         alors: »
  E017 mécanisme invalide [syntax error]
       ╒══  syntax_error.publicodes:15:7 ══
    14 │   variations:
    15 │     - sinon: 200 # KO
       │       ˘˘˘˘˘˘
   Hint: La clé `sinon` n'est pas valide
  E017 mécanisme invalide [syntax error]
       ╒══  syntax_error.publicodes:14:3 ══
    13 │ c:
    14 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: Une variation doit contenir « si: » et «
         alors: »
  E017 mécanisme invalide [syntax error]
       ╒══  syntax_error.publicodes:20:3 ══
    19 │ d:
    20 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: Il doit y avoir au moins une variation en plus de
         la clause « sinon »
  E002
  mot clé inattendu : Stream_end (attendu : the beginning of file)
  [yaml error]
  <could not read source file>
  
  [123]
