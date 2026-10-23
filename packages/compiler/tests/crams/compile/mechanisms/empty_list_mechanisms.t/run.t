Empty list should default to not applicable values:

  $ publicodes compile ./inputs/ -o - -t debug_eval_tree
  should be not applicable:
    get_context(should be not applicable)
  
  should be not applicable . average:
    not_applicable
  
  should be not applicable . max of:
    not_applicable
  
  should be not applicable . min of:
    not_applicable
  
  should be not applicable . product:
    not_applicable
  
  should be not applicable . sum:
    not_applicable
  
  should default to false:
    get_context(should default to false)
  
  should default to false . one of:
    false
  
  should default to true:
    get_context(should default to true)
  
  should default to true . all of:
    true
