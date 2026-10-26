Rend non applicable take precedence over exclusive remplace

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    true
  
  a':
    false
  
  b:
    true
  
  c:
    get_context(c)
  
  x:
    if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
    then exclusive_replacement(@c, [@a', @a])
    else not_applicable
