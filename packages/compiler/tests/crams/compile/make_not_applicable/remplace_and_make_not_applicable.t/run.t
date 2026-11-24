Rend non applicable take precedence over remplace

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then true
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then true
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then get_context(c)
    else ctx_value
  
  x:
    if is_not_defined ctx_value
    then if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
      then if @a != not_applicable
        then @a
        else @c
      else not_applicable
    else ctx_value
