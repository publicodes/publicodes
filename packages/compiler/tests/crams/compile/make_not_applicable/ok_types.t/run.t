A rule could make an other rule not applicable even if they are not of the same
type:

  $ publicodes compile ./input/ -t debug_eval_tree -o -
  make not applicable on different type:
    if (@make not applicable on different type . number rule = not_applicable) || ((is_not_defined @make not applicable on different type . number rule) || (@make not applicable on different type . number rule = false))
    then @make not applicable on different type . boolean rule
    else not_applicable
  
  make not applicable on different type . boolean rule:
    get_context(make not applicable on different type . boolean rule)
  
  make not applicable on different type . number rule:
    get_context(make not applicable on different type . number rule)
