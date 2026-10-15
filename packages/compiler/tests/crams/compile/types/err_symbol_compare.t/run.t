Comparison with symbols should fail with two incompatible literals:

  $ publicodes compile ./input/ -o - -t debug_eval_tree
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./input/rules.publicodes:1:4 ══
     1 │ a: 'foo'
       │    ˘˘˘˘˘ est le symbole 'foo'
       ╒══  ./input/rules.publicodes:3:8 ══
     2 │ b: a = 'foo' # ack
     3 │ c: a = 'bar' # nack
       │        ˘˘˘˘˘˘ est le symbole 'bar'
  
  [123]

