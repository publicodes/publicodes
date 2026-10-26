Multiple definitions

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @b
    else not_applicable
  
  x:
    @c
  
  y:
    if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @c
    else not_applicable + if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @x
    else not_applicable
