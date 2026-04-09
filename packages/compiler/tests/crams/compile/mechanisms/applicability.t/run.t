Should correctly transform `applicable si` mechanism:

  $ publicodes compile ./applicable_si.publicodes -t debug_eval_tree -o -
  condition:
    get_context(condition)
  
  test:
    if (is_not_defined @condition) || ((@condition = false) || (@condition = not_applicable))
    then 10.
    else not_applicable

Should correctly transform `non applicable si` mechanism:

  $ publicodes compile ./non_applicable_si.publicodes -t debug_eval_tree -o -
  condition:
    get_context(condition)
  
  test:
    if (is_not_defined @condition) || ((@condition = false) || (@condition = not_applicable))
    then not_applicable
    else 10.
