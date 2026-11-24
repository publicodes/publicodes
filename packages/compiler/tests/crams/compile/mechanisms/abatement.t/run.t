Flat :

  $ publicodes compile ./flat -t debug_eval_tree -o -
  revenu imposable:
    0. max (if is_not_defined ctx_value
    then 10000. €
    else ctx_value - 2000. €)

Percentage :

  $ publicodes compile ./percentage -t debug_eval_tree -o -
  revenu imposable:
    0. max (if is_not_defined ctx_value
    then 2000. €
    else ctx_value - ((if is_not_defined ctx_value
    then 2000. €
    else ctx_value * 10. %) * 0.01))

Ref :

  $ publicodes compile ./ref -t debug_eval_tree -o -
  revenu imposable:
    0. max (if is_not_defined ctx_value
    then 10000. €
    else ctx_value - @tax)
  
  tax:
    if is_not_defined ctx_value
    then 2000. €
    else ctx_value
