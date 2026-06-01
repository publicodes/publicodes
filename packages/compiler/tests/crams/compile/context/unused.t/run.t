Invalid :

  $ publicodes compile unused -t debug_eval_tree -o -
  E038 certaines règles du contexte non utilisées
  [syntax error]
       ╒══  unused/rules.publicodes:2:3 ══
     1 │ a:
     2 │   contexte:
       │   ˘˘˘˘˘˘˘˘˘
   Hint: ces contextes ne sont pas utilisés :
         - b
  [123]

  $ publicodes compile override -t debug_eval_tree -o -
  E038 certaines règles du contexte non utilisées
  [syntax error]
       ╒══  override/rules.publicodes:3:3 ══
     2 │   valeur: b
     3 │   contexte:
       │   ˘˘˘˘˘˘˘˘˘
   Hint: ces contextes ne sont pas utilisés :
         - c
  [123]
