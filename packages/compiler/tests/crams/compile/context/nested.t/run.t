Should correctly parse rules with nested contexts:

  $ publicodes compile ./src -t debug_eval_tree -o -
  test:
    10.
  
  w:
    @test + @z
  
  z:
    with: {
      test = 20.
    }
    in
    with: {
      test = 30.
    }
    in
    @test + with: {
      z = 30.
    }
    in
    @w
