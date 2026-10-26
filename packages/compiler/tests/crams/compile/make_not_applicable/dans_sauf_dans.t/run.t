make not applicable in / except in :

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  x:
    if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
    then @c
    else not_applicable
  
  y:
    @c
  
  z:
    if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @c
    else not_applicable
