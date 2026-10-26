multiple on same rule ok :

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  x:
    get_context(x)
  
  y:
    if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
      then if (@c = not_applicable) || ((is_not_defined @c) || (@c = false))
        then @x
        else not_applicable
      else not_applicable
    else not_applicable
