The compiler should correctly manage unicodes in the source code.

  $ publicodes compile input -t debug_eval_tree -o -
  réééégime:
    if is_not_defined ctx_value
    then "⭐"
    else ctx_value
  
  test:
    if is_not_defined ctx_value
    then @réééégime
    else ctx_value
