Empty list should default to not applicable values:

  $ publicodes compile ./inputs/ -o - -t debug_eval_tree
  should be not applicable:
    if is_not_defined ctx_value
    then get_context(should be not applicable)
    else ctx_value
  
  should be not applicable . average:
    if is_not_defined ctx_value
    then not_applicable
    else ctx_value
  
  should be not applicable . max of:
    if is_not_defined ctx_value
    then not_applicable
    else ctx_value
  
  should be not applicable . min of:
    if is_not_defined ctx_value
    then not_applicable
    else ctx_value
  
  should be not applicable . product:
    if is_not_defined ctx_value
    then not_applicable
    else ctx_value
  
  should be not applicable . sum:
    if is_not_defined ctx_value
    then not_applicable
    else ctx_value
  
  should default to false:
    if is_not_defined ctx_value
    then get_context(should default to false)
    else ctx_value
  
  should default to false . one of:
    if is_not_defined ctx_value
    then false
    else ctx_value
  
  should default to true:
    if is_not_defined ctx_value
    then get_context(should default to true)
    else ctx_value
  
  should default to true . all of:
    if is_not_defined ctx_value
    then true
    else ctx_value
