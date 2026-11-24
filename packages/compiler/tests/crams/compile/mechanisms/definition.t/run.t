Should correctly transform `est défini` mechanism:

  $ publicodes compile ./is_defined -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then (is_not_defined @b) = false
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 10.
    else ctx_value

Should correctly be used within `applicable si` mechanism:

  $ publicodes compile ./is_defined_in_applicable_if -t debug_eval_tree -o -
  a:
    if (is_not_defined (is_not_defined @b) = false) || ((((is_not_defined @b) = false) = false) || (((is_not_defined @b) = false) = not_applicable))
    then not_applicable
    else if is_not_defined ctx_value
      then 10.
      else ctx_value
  
  b:
    if is_not_defined ctx_value
    then get_context(b)
    else ctx_value

Should correctly transform `est non défini` mechanism:

  $ publicodes compile ./is_undefined  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then is_not_defined @b
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 10.
    else ctx_value
