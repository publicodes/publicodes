valid simple make not applicable :

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  x:
    if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @b
    else not_applicable
