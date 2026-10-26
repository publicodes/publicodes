Comparison with symbols should fail with two incompatible literals:

  $ publicodes compile ./input/ -o - -t debug_eval_tree
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:1:4
    1 │  a: 'foo'
      │     ^^^^^ est le symbole 'foo'
    2 │  b: a = 'foo' # ack
    3 │  c: a = 'bar' # nack
      │         ˘˘˘˘˘ est le symbole 'bar'
    4 │  
  
  [123]

