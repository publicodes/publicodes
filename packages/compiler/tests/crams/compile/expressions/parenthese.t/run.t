Valid parenthesis expression :

  $ publicodes compile simple -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then 4.5
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 4.5 + 3.
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then 4.
    else ctx_value
  
  d:
    if is_not_defined ctx_value
    then 4. + 5.
    else ctx_value
  
  e:
    if is_not_defined ctx_value
    then - 3.
    else ctx_value
  
  f:
    if is_not_defined ctx_value
    then - 4. - 3.
    else ctx_value

Invalid parenthesis expression :

  $ publicodes compile missing -t debug_eval_tree -o -
  
  E008 caractère invalide [syntax error]
       ╒══  missing/rules.publicodes:1:5 ══
     1 │ a: (
       │     
  
  
  E002 mot clé inattendu : Tokens.LPAREN [syntax
  error]
       ╒══  missing/rules.publicodes:2:6 ══
     1 │ a: (
     2 │ b: 4 ()
       │      ˘˘
  
  
  E002 mot clé inattendu : Tokens.RPAREN [syntax
  error]
       ╒══  missing/rules.publicodes:3:5 ══
     2 │ b: 4 ()
     3 │ c: 6)
       │     ˘
  
  [123]
