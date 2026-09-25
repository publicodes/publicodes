Type inference should be ok:

  $ publicodes compile ./input/ -o - -t debug_eval_tree
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  d:
    if (@a > 50.) = true
    then 'foo'
    else if (@a > 40.) = true
      then 'bar'
      else not_applicable
  
  e:
    get_context(e)
  
  f:
    if (20. = 50.) = true
    then 'foo'
    else if (20. > 50.) = true
      then 'bar'
      else not_applicable
  
  g:
    if true = true
    then @g . a
    else if true = true
      then @g . b
      else not_applicable
  
  g . a:
    'foo'
  
  g . b:
    'bar'
  
  h:
    if true = true
    then @h . a
    else if true = true
      then if @h . c != not_applicable
        then @h . c
        else @h . b
      else not_applicable
  
  h . a:
    'foo'
  
  h . b:
    'bar'
  
  h . c:
    'toot'
  
  i:
    if true = true
    then @i . a
    else if true = true
      then @i . b
      else if true = true
        then if true = true
          then @i . c
          else if true = true
            then @i . d
            else not_applicable
        else not_applicable
  
  i . a:
    'foo'
  
  i . b:
    'bar'
  
  i . c:
    'super'
  
  i . d:
    'toot'
  
  test a:
    @a = 42.
  
  test b:
    @b = Shared_ast.Day {day = 11; year = 2000; month = 1}
  
  test c:
    @c = "foo"
  
  test d:
    @d = 'foo'
  
  test e:
    @e = 'bar'
  
  test f:
    @f = 'toot'
