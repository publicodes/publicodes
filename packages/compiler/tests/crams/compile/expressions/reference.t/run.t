Valid :

  $ publicodes compile valid  -t debug_eval_tree -o -
  b:
    get_context(b)
  
  b . a:
    @b . c
  
  b . c:
    @c
  
  c:
    5.
