Nested definitions should be correctly resolved:

  $ publicodes compile ./ok/ -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then get_context(a)
    else ctx_value
  
  a . a:
    if is_not_defined ctx_value
    then get_context(a . a)
    else ctx_value
  
  a . a . a:
    if is_not_defined ctx_value
    then @a . a
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then get_context(b)
    else ctx_value
  
  b . b:
    if is_not_defined ctx_value
    then @b . b . b
    else ctx_value
  
  b . b . b:
    if is_not_defined ctx_value
    then get_context(b . b . b)
    else ctx_value

Cycle should be found:

  $ publicodes compile ./error/ -o -
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  ./error/cycle.publicodes:4:15 ══
     3 │     b:
     4 │       valeur: b
       │               ˘ la règle se référence elle-même
  
  [123]

