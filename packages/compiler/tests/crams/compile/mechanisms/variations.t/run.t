Correclty formatted variations :

  $ publicodes compile ./ok -t debug_eval_tree -o -
  cond1:
    if is_not_defined ctx_value
    then get_context(cond1)
    else ctx_value
  
  cond2:
    if is_not_defined ctx_value
    then get_context(cond2)
    else ctx_value
  
  cond3:
    if is_not_defined ctx_value
    then get_context(cond3)
    else ctx_value
  
  multiple:
    if is_not_defined ctx_value
    then if @cond1 = true
      then 200.
      else if @cond2 = true
        then 300.
        else if @cond3 = true
          then 400.
          else 500.
    else ctx_value
  
  sans sinon:
    if is_not_defined ctx_value
    then if @cond1 = true
      then 200.
      else not_applicable
    else ctx_value
  
  simple:
    if is_not_defined ctx_value
    then if @cond1 = true
      then 200.
      else 300.
    else ctx_value

Wrongly formatted variations :

  $ publicodes compile ./syntax_error -t debug_eval_tree -o -
  
  E017 mécanisme invalide [syntax error]
       ╒══  ./syntax_error/rules.publicodes:5:7 ══
     4 │       alors: 200
     5 │       sinon: 300 #KO
       │       ˘˘˘˘˘˘
   Hint: La clé `sinon` n'est pas valide
  
  E017 mécanisme invalide [syntax error]
       ╒══  ./syntax_error/rules.publicodes:8:3 ══
     7 │ b:
     8 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: clef `alors` attendue
  
  E017 mécanisme invalide [syntax error]
       ╒══  ./syntax_error/rules.publicodes:14:3 ══
    13 │ c:
    14 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: clef `si` attendue
  
  E017 mécanisme invalide [syntax error]
       ╒══  ./syntax_error/rules.publicodes:15:7 ══
    14 │   variations:
    15 │     - sinon: 200 # KO
       │       ˘˘˘˘˘˘
   Hint: La clé `sinon` n'est pas valide
  
  E017 mécanisme invalide [syntax error]
       ╒══  ./syntax_error/rules.publicodes:20:3 ══
    19 │ d:
    20 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: Il doit y avoir au moins une variation en plus de
         la clause « sinon »
  [123]
