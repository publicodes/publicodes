Simple base type (bool, number, date) :

  $ publicodes compile base.publicodes  -t debug_eval_tree -o -
  a :
  12.
  
  b :
  true
  
  c :
  false
  
  d :
  Shared_ast.Day {day = 11; year = 2024; month = 6}
  
  e :
  Shared_ast.Month {month = 8; year = 2025}


String :

  $ publicodes compile string.publicodes  -t debug_eval_tree -o -
  a :
  "bla"
  
  b :
  "ouaha ouhah"
  
  c :
  "'foo'bar'"
  
  d :
  "No : "foo""


Number with unit :

  $ publicodes compile number_with_unit.publicodes  -t debug_eval_tree -o -
  a :
  12. €
  
  b :
  3.5 €
  
  c :
  4. kgCO2e/an
  
  d :
  5. %/an
  
  e :
  64465.55 h.kW/maison
  
  kg par m² :
  3. kg/m^2
  
  pound :
  4. £
  
  yen :
  5. ¥
