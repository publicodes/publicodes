Rend non applicable take precedence over exclusive remplace

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then true
    else ctx_value
  
  a':
    if is_not_defined ctx_value
    then false
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
      then exclusive_replacement(@c, [@a', @a])
      else not_applicable
    else ctx_value
