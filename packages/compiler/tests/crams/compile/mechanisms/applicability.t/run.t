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

Should correctly detect namespace cycle:

  $ publicodes compile ./namespace_cycle -t debug_eval_tree -o -
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  ./namespace_cycle/rules.publicodes:1:1 ══
     1 │ a:
       │ ˘˘ règle 'a' référencée ici
       ╒══  ./namespace_cycle/rules.publicodes:3:22 ══
     2 │   valeur: 10
     3 │   non applicable si: b
       │                      ˘ règle 'a . b' référencée de nouveau
  
  [123]
