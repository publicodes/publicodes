Should correctly transform `est défini` mechanism:

  $ publicodes compile ./is_defined -t debug_eval_tree -o -
  a:
    (is_not_defined @b) = false
  
  b:
    10.

Should correctly be used within `applicable si` mechanism:

  $ publicodes compile ./is_defined_in_applicable_if -t debug_eval_tree -o -
  a:
    if (is_not_defined (is_not_defined @b) = false) || ((((is_not_defined @b) = false) = false) || (((is_not_defined @b) = false) = not_applicable))
    then not_applicable
    else 10.
  
  b:
    get_context(b)

Should correctly transform `est non défini` mechanism:

  $ publicodes compile ./is_undefined  -t debug_eval_tree -o -
  a:
    is_not_defined @b
  
  b:
    10.
