Rend non applicable take precedence over remplace

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    true
  
  b:
    true
  
  c:
    get_context(c)
  
  x:
    if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
    then if @a != not_applicable
      then @a
      else @c
    else not_applicable
