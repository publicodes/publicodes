transitivity in make not applicable :

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  x:
    if (if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
      then @b
      else not_applicable = not_applicable) || ((is_not_defined if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
      then @b
      else not_applicable) || (if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
      then @b
      else not_applicable = false))
    then @c
    else not_applicable
