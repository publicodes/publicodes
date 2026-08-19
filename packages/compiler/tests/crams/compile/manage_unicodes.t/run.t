The compiler should correctly manage unicodes in the source code.

  $ publicodes compile input -t debug_eval_tree -o -
  réééégime:
    "⭐"
  
  test:
    @réééégime
