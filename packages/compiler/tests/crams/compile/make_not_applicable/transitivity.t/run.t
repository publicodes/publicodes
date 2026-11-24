transitivity in make not applicable :

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then get_context(a)
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then get_context(b)
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then get_context(c)
    else ctx_value
  
  x:
    if is_not_defined ctx_value
    then if (if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
        then @b
        else not_applicable = not_applicable) || ((is_not_defined if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
        then @b
        else not_applicable) || (if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
        then @b
        else not_applicable = false))
      then @c
      else not_applicable
    else ctx_value
