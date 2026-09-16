Nested definitions should be correctly resolved:

  $ publicodes compile ./ok/ -t debug_eval_tree -o -
  a:
    get_context(a)
  
  a . a:
    get_context(a . a)
  
  a . a . a:
    @a . a
  
  b:
    get_context(b)
  
  b . b:
    @b . b . b
  
  b . b . b:
    get_context(b . b . b)

Cycle should be found:

  $ publicodes compile ./error/ -o -
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  ./error/cycle.publicodes:4:15 ══
     3 │     b:
     4 │       valeur: b
       │               ˘ la règle se référence elle-même
  
  [123]

