should correctly handle empty mechanisms:

  $ publicodes compile ./input/ -t debug_eval_tree -o - 
  max of:
    if is_not_defined ctx_value
    then not_applicable
    else ctx_value
  
  min of:
    if is_not_defined ctx_value
    then not_applicable
    else ctx_value
  
  product:
    if is_not_defined ctx_value
    then not_applicable
    else ctx_value
  
  sum:
    if is_not_defined ctx_value
    then not_applicable
    else ctx_value
