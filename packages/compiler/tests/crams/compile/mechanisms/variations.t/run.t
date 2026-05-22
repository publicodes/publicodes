Correclty formatted variations :

  $ publicodes compile ./ok.publicodes -t debug_eval_tree -o -
  cond1:
    get_context(cond1)
  
  cond2:
    get_context(cond2)
  
  cond3:
    get_context(cond3)
  
  multiple:
    if @cond1 = true
    then 200.
    else if @cond2 = true
      then 300.
      else if @cond3 = true
        then 400.
        else 500.
  
  sans sinon:
    if @cond1 = true
    then 200.
    else not_applicable
  
  simple:
    if @cond1 = true
    then 200.
    else 300.

Wrongly formatted variations :

  $ publicodes compile ./syntax_error.publicodes -t debug_eval_tree -o -
  E017 mécanisme invalide [syntax error]
       ╒══  ./syntax_error.publicodes:5:7 ══
     4 │       alors: 200
     5 │       sinon: 300 #KO
       │       ˘˘˘˘˘˘
   Hint: La clé `sinon` n'est pas valide
  E017 mécanisme invalide [syntax error]
       ╒══  ./syntax_error.publicodes:8:3 ══
     7 │ b:
     8 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: Une variation doit contenir « si: » et «
         alors: »
  E017 mécanisme invalide [syntax error]
       ╒══  ./syntax_error.publicodes:15:7 ══
    14 │   variations:
    15 │     - sinon: 200 # KO
       │       ˘˘˘˘˘˘
   Hint: La clé `sinon` n'est pas valide
  E017 mécanisme invalide [syntax error]
       ╒══  ./syntax_error.publicodes:14:3 ══
    13 │ c:
    14 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: Une variation doit contenir « si: » et «
         alors: »
  E017 mécanisme invalide [syntax error]
       ╒══  ./syntax_error.publicodes:20:3 ══
    19 │ d:
    20 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: Il doit y avoir au moins une variation en plus de
         la clause « sinon »
  [123]
