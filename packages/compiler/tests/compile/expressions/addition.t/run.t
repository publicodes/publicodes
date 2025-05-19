Simple addition/soustraction expression :

  $ publicodes compile simple.publicodes -o -
  {
  "evaluationTree": { "simple expression": [ [ 12.0 ], "+", [ 4.5 ] ] },
  "outputs": [],
  "parameters": {},
  "types": {}
  }

Missing term :

  $ publicodes compile missing_term.publicodes
  error[E006]: expression malformée (syntaxe)
      ┌─ missing_term.publicodes:1:23
    1 │  missing last term: 12 **
      │                        ^^ une valeur (nombre, booléean, date) ou une référence est attendue APRÈS l'opérateur `**`
      = supprimez l'opérateur `**` ou bien ajoutez une expression

  error[E006]: expression malformée (syntaxe)
      ┌─ missing_term.publicodes:2:14
    2 │  an other: 12 +
      │               ^ une valeur (nombre, booléean, date) ou une référence est attendue APRÈS l'opérateur `+`
      = supprimez l'opérateur `+` ou bien ajoutez une expression

  error[E006]: expression malformée (syntaxe)
      ┌─ missing_term.publicodes:4:20
    4 │  missing left term: / 2
      │                     ^ une valeur (nombre, booléean, date) ou une référence est attendue AVANT l'opérateur `/`
      = supprimez l'opérateur `/` ou bien ajoutez une expression

  [1]

