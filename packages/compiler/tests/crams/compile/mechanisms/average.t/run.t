Ok moyenne :
  $ publicodes compile ok -t debug_eval_tree -o -
  a:
    (20. + 10.) / (if 20. != not_applicable
    then 1.
    else 0. + if 10. != not_applicable
    then 1.
    else 0.)
