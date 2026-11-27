make not applicable in / except in :

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
    then if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
      then @c
      else not_applicable
    else ctx_value
  
  y:
    if is_not_defined ctx_value
    then @c
    else ctx_value
  
  z:
    if is_not_defined ctx_value
    then if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
      then @c
      else not_applicable
    else ctx_value
