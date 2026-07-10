Should correctly transform `est défini` mechanism:

  $ publicodes compile ./est_defini -t debug_eval_tree -o -
  a:
    @b != not_applicable
  
  b:
    10.

Should correctly transform `est non défini` mechanism:

  $ publicodes compile ./est_non_defini	 -t debug_eval_tree -o -
  a:
    @b = not_applicable
  
  b:
    10.


Should correctly be used within `applicable si` mechanism:

  $ publicodes compile ./est_defini_dans_applicable_si -t debug_eval_tree -o -
  a:
    if (is_not_defined (is_not_defined @b) = false) || ((((is_not_defined @b) = false) = false) || (((is_not_defined @b) = false) = not_applicable))
    then not_applicable
    else 10.
  
  b:
    get_context(b)
