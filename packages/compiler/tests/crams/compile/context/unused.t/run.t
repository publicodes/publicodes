Invalid :

  $ publicodes compile unused -t debug_eval_tree -o -
  E038 certaines règles du contexte non utilisées
  [syntax error]
       ╒══  unused/rules.publicodes:3:5 ══
     2 │   contexte:
     3 │     b: 4  # doit lever une erreur
       │     ˘˘ contexte inutilisé
  
  [123]

  $ publicodes compile override -t debug_eval_tree -o -
  E038 certaines règles du contexte non utilisées
  [syntax error]
       ╒══  override/rules.publicodes:4:5 ══
     3 │   contexte:
     4 │     c: 1  # doit lever une erreur
       │     ˘˘ contexte inutilisé
  
  [123]

  $ publicodes compile works -t debug_eval_tree -o -
  x:
    with
    {
    x . a = 1.
    x . b = 1.
    }
    in
    @x . y + @x . w
  
  x . a:
    0.
  
  x . b:
    0.
  
  x . w:
    @x . a
  
  x . y:
    with
    {
    x . a = 2.
    }
    in
    @x . a + @x . b
