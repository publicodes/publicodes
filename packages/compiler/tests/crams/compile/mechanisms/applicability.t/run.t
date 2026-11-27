Should correctly transform `applicable si` mechanism:

  $ publicodes compile ./applicable_if -t debug_eval_tree -o -
  condition:
    if is_not_defined ctx_value
    then get_context(condition)
    else ctx_value
  
  test:
    if (is_not_defined @condition) || ((@condition = false) || (@condition = not_applicable))
    then not_applicable
    else if is_not_defined ctx_value
      then 10.
      else ctx_value

Should correctly transform `est applicable` mechanism:

  $ publicodes compile ./is_applicable -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then @b != not_applicable
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 10.
    else ctx_value

Should correctly transform `est non applicable` mechanism:

  $ publicodes compile ./is_not_applicable	 -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then @b = not_applicable
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 10.
    else ctx_value

Should correctly transform `non applicable si` mechanism:

  $ publicodes compile ./not_applicable_if -t debug_eval_tree -o -
  condition:
    if is_not_defined ctx_value
    then get_context(condition)
    else ctx_value
  
  test:
    if (is_not_defined @condition) || ((@condition = false) || (@condition = not_applicable))
    then if is_not_defined ctx_value
      then 10.
      else ctx_value
    else not_applicable

Should correctly detect namespace cycle:

  $ publicodes compile ./namespace_cycle -t debug_eval_tree -o -
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  ./namespace_cycle/rules.publicodes:3:22 ══
     2 │   valeur: 10
     3 │   non applicable si: b
       │                      ˘ règle 'a . b' référencée ici
       ╒══  ./namespace_cycle/rules.publicodes:4:3 ══
     3 │   non applicable si: b
     4 │   rend la branche applicable: oui
       │   ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘ règle 'a' référencée de nouveau
  
  [123]
