Context defining a rule that is not referenced should trigger a warning:

  $ publicodes compile ./unused/ -t debug_eval_tree -o -
  
  E038
  certaines règles du contexte sont non utilisées [syntax error]
       ╒══  ./unused/rules.publicodes:4:5 ══
     3 │   contexte:
     4 │     b: 4  # doit lever une erreur
       │     ˘˘ contexte inutilisé
  
  [123]

Context overriding a previous context rule that is not used before the second
context should trigger a warning: 

  $ publicodes compile ./override/ -t debug_eval_tree -o -
  
  E038
  certaines règles du contexte sont non utilisées [syntax error]
       ╒══  ./override/rules.publicodes:4:5 ══
     3 │   contexte:
     4 │     c: 1  # doit lever une erreur
       │     ˘˘ contexte inutilisé
  
  [123]

Should handle nested contexts in the same rule:

  $ publicodes compile ./nested/ -t debug_eval_tree -o -
  
  E038
  certaines règles du contexte sont non utilisées [syntax error]
       ╒══  ./nested/test1.publicodes:14:5 ══
    13 │   contexte:
    14 │     test: 20 # non utilisé
       │     ˘˘˘˘˘ contexte inutilisé
  
  
  E038
  certaines règles du contexte sont non utilisées [syntax error]
       ╒══  ./nested/test2.publicodes:8:9 ══
     7 │       contexte:
     8 │         b: 10 # non utilisé
       │         ˘˘ contexte inutilisé
  
  
  E038
  certaines règles du contexte sont non utilisées [syntax error]
       ╒══  ./nested/test2.publicodes:11:9 ══
    10 │       contexte:
    11 │         b: 10 # non utilisé
       │         ˘˘ contexte inutilisé
       ╒══  ./nested/test2.publicodes:12:9 ══
    11 │         b: 10 # non utilisé
    12 │         c: 20 # non utilisé
       │         ˘˘ contexte inutilisé
  
  [123]
