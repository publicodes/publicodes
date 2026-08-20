Applicabilité étendue à l'espace de nom :

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    get_context(a)
  
  a . b:
    if (is_not_applicable @a) || ((is_not_defined @a) || (@a = false))
    then not_applicable
    else 42.
  
  a1:
    get_context(a1)
  
  a1 . b1:
    if (is_not_applicable if (@c1 = not_applicable) || ((is_not_defined @c1) || (@c1 = false))
      then @a1
      else not_applicable) || ((is_not_defined if (@c1 = not_applicable) || ((is_not_defined @c1) || (@c1 = false))
      then @a1
      else not_applicable) || (if (@c1 = not_applicable) || ((is_not_defined @c1) || (@c1 = false))
      then @a1
      else not_applicable = false))
    then not_applicable
    else 42.
  
  c1:
    true
