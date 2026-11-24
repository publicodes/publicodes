Simple base type (bool, number, date) :

  $ publicodes compile base  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then 12.
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then true
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then false
    else ctx_value
  
  d:
    if is_not_defined ctx_value
    then Shared_ast.Day {day = 11; year = 2024; month = 6}
    else ctx_value
  
  e:
    if is_not_defined ctx_value
    then Shared_ast.Month {month = 8; year = 2025}
    else ctx_value


String :

  $ publicodes compile string  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then "bla"
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then "'foo'bar'"
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then "bla"foo"
    else ctx_value

Symbol :

  $ publicodes compile symbol  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then 'ouaha ouhah'
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 'No : "foo"'
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then 'boo'hou'
    else ctx_value


Number with unit :

  $ publicodes compile number_with_unit  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then 12. €
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 3.5 €
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then 4. kgCO2e/an
    else ctx_value
  
  d:
    if is_not_defined ctx_value
    then 5. %/an
    else ctx_value
  
  e:
    if is_not_defined ctx_value
    then 64465.55 h.kW/maison
    else ctx_value
  
  kg par m²:
    if is_not_defined ctx_value
    then 3. kg/m^2
    else ctx_value
  
  pound:
    if is_not_defined ctx_value
    then 4. £
    else ctx_value
  
  yen:
    if is_not_defined ctx_value
    then 5. ¥
    else ctx_value
