Comparison with symbols should fail with two incompatible literals:

  $ publicodes compile ./input/ -o - -t debug_eval_tree
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:3:6
    2 │  b: a = 'foo' # ack
    3 │  c: a = 'bar' # nack
      │     ˘ ^ ˘˘˘˘˘ est le symbole 'bar'
      │     │ │
      │     │ opération invalide
      │     est le symbole 'foo'
    4 │  
      = (aide) l'opération `=` s'applique uniquement sur des valeurs de même type
  
  [123]

