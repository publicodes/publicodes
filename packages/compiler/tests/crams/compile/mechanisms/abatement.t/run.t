Flat :

  $ publicodes compile ./flat -t debug_eval_tree -o -
  revenu imposable:
    10000. € - 2000. €

Percentage :

  $ publicodes compile ./percentage -t debug_eval_tree -o -
  revenu imposable:
    2000. € - ((2000. € * 10. %) * 0.01)

Ref :

  $ publicodes compile ./ref -t debug_eval_tree -o -
  revenu imposable:
    10000. € - @tax
  
  tax:
    2000. €
