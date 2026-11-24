valid rule name :

  $ publicodes compile nom  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then get_context(a)
    else ctx_value
  
  arrondi à 0.5 près:
    if is_not_defined ctx_value
    then get_context(arrondi à 0.5 près)
    else ctx_value
  
  arrondi à 2 décimales:
    if is_not_defined ctx_value
    then get_context(arrondi à 2 décimales)
    else ctx_value
  
  arrondi à l'unité:
    if is_not_defined ctx_value
    then get_context(arrondi à l'unité)
    else ctx_value
  
  garde-côte:
    if is_not_defined ctx_value
    then get_context(garde-côte)
    else ctx_value
  
  scénario T+3°C:
    if is_not_defined ctx_value
    then get_context(scénario T+3°C)
    else ctx_value
