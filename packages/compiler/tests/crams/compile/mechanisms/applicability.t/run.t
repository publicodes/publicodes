Should correctly transform `applicable si` mechanism:

  $ publicodes compile ./applicable_if -t debug_eval_tree -o -
  condition:
    get_context(condition)
  
  test:
    if (is_not_defined @condition) || ((@condition = false) || (@condition = not_applicable))
    then not_applicable
    else 10.

Should correctly transform `est applicable` mechanism:

  $ publicodes compile ./is_applicable -t debug_eval_tree -o -
  a:
    @b != not_applicable
  
  b:
    10.

Should correctly transform `est non applicable` mechanism:

  $ publicodes compile ./is_not_applicable	 -t debug_eval_tree -o -
  a:
    @b = not_applicable
  
  b:
    10.

Should correctly transform `non applicable si` mechanism:

  $ publicodes compile ./not_applicable_if -t debug_eval_tree -o -
  condition:
    get_context(condition)
  
  test:
    if (is_not_defined @condition) || ((@condition = false) || (@condition = not_applicable))
    then 10.
    else not_applicable
