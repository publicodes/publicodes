Simple addition/soustraction expression :

  $ publicodes compile simple -t debug_eval_tree -o -
  simple expression:
    12. + 4.5

Missing term :

  $ publicodes compile missing_term
  error[E007]: expression malformée
      ╒══ missing_term/rules.publicodes:1:14
    1 │  an other: 12 +
      │               ˘ une valeur ou une référence sont attendues après l'opérateur `+`
    2 │  
      = (aide) supprimez l'opérateur `+` ou bien ajoutez une expression
  
  [123]
