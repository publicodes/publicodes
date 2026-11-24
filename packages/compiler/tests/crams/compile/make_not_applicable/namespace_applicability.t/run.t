Applicabilité étendue :

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then get_context(a)
    else ctx_value
  
  a . b:
    if is_not_defined ctx_value
    then 42.
    else ctx_value
  
  a1:
    if is_not_defined ctx_value
    then get_context(a1)
    else ctx_value
  
  a1 . b1:
    if is_not_defined ctx_value
    then 42.
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then if (is_not_applicable @a) || ((is_not_defined @a) || (@a = false))
      then not_applicable
      else @a . b
    else ctx_value
  
  c1:
    if is_not_defined ctx_value
    then true
    else ctx_value
  
  d1:
    if is_not_defined ctx_value
    then if (is_not_applicable if (@c1 = not_applicable) || ((is_not_defined @c1) || (@c1 = false))
        then @a1
        else not_applicable) || ((is_not_defined if (@c1 = not_applicable) || ((is_not_defined @c1) || (@c1 = false))
        then @a1
        else not_applicable) || (if (@c1 = not_applicable) || ((is_not_defined @c1) || (@c1 = false))
        then @a1
        else not_applicable = false))
      then not_applicable
      else @a1 . b1
    else ctx_value
