Simple addition/soustraction expression :

  $ publicodes compile simple.publicodes -t debug_eval_tree -o -
  { "evaluation": [ [ "+", 1, 2 ], 12.0, 4.5 ], "outputs": {} }

Missing term :

  $ publicodes compile missing_term.publicodes
  E006 expression malformée [syntax error]
       ╒══  missing_term.publicodes:1:23 ══
     1 │ missing last term: 12 **
       │                       ˘˘ une valeur ou une référence sont attendues après l'opérateur `**`
   Hint: supprimez l'opérateur `**` ou bien ajoutez une
         expression
  E006 expression malformée [syntax error]
       ╒══  missing_term.publicodes:2:14 ══
     1 │ missing last term: 12 **
     2 │ an other: 12 +
       │              ˘ une valeur ou une référence sont attendues après l'opérateur `+`
   Hint: supprimez l'opérateur `+` ou bien ajoutez une
         expression
  E006 expression malformée [syntax error]
       ╒══  missing_term.publicodes:4:20 ══
     3 │
     4 │ missing left term: / 2
       │                    ˘˘ une valeur (nombre, booléean, date) ou une référence est attendue AVANT l'opérateur `/`
   Hint: supprimez l'opérateur `/` ou bien ajoutez une
         expression
  [123]
