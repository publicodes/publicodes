Simple addition/soustraction expression :

  $ publicodes compile simple.publicodes -t debug_eval_tree -o -
  simple expression:
    12. + 4.5

Missing term :

  $ publicodes compile missing_term.publicodes
  E007 expression malformée [syntax error]
       ╒══  missing_term.publicodes:1:14 ══
     1 │ an other: 12 +
       │              ˘ une valeur ou une référence sont attendues après l'opérateur `+`
   Hint: supprimez l'opérateur `+` ou bien ajoutez une
         expression
  [123]
