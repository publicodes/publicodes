Valid :

  $ publicodes compile input -t debug_eval_tree -o -
  a:
    10.
  
  test:
    @a
  
  z:
    with
    {
    test = 20.
    }
    in
    with
    {
    test = 30.
    }
    in
    @test + @test
