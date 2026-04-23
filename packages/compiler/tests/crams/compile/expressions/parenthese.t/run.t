Valid parenthesis expression :

  $ publicodes compile simple -t debug_eval_tree -o -
  a:
    4.5
  
  b:
    4.5 + 3.
  
  c:
    4.
  
  d:
    4. + 5.
  
  e:
    - 3.
  
  f:
    - 4. - 3.

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
