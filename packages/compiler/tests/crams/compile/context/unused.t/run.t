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
