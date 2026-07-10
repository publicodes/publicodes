Should correctly transform `applicable si` mechanism:

  $ publicodes compile ./applicable_si -t debug_eval_tree -o -
  condition:
    get_context(condition)
  
  test:
    if (is_not_defined @condition) || ((@condition = false) || (@condition = not_applicable))
    then 10.
    else not_applicable

Should correctly transform `non applicable si` mechanism:

  $ publicodes compile ./non_applicable_si -t debug_eval_tree -o -
  condition:
    get_context(condition)
  
  test:
    if (is_not_defined @condition) || ((@condition = false) || (@condition = not_applicable))
    then not_applicable
    else 10.

Should correctly transform `est applicable` mechanism:

  $ publicodes compile ./est_applicable -t debug_eval_tree -o -
  a:
    (is_not_defined @b) = false
  
  b:
    10.

Should correctly transform `est non applicable` mechanism:

  $ publicodes compile ./est_non_applicable	 -t debug_eval_tree -o -
  a:
    is_not_defined @b
  
  b:
    10.
