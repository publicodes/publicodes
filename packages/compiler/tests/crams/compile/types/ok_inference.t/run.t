Type inference should be ok:

  $ publicodes compile ./input/ -o - -t debug_eval_tree
  a:
    if is_not_defined ctx_value
    then get_context(a)
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then get_context(b)
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then get_context(c)
    else ctx_value
  
  d:
    if is_not_defined ctx_value
    then if (@a > 50.) = true
      then 'foo'
      else if (@a > 40.) = true
        then 'bar'
        else not_applicable
    else ctx_value
  
  e:
    if is_not_defined ctx_value
    then get_context(e)
    else ctx_value
  
  f:
    if is_not_defined ctx_value
    then if (20. = 50.) = true
      then 'foo'
      else if (20. > 50.) = true
        then 'bar'
        else not_applicable
    else ctx_value
  
  g:
    if is_not_defined ctx_value
    then if true = true
      then @g . a
      else if true = true
        then @g . b
        else not_applicable
    else ctx_value
  
  g . a:
    if is_not_defined ctx_value
    then 'foo'
    else ctx_value
  
  g . b:
    if is_not_defined ctx_value
    then 'bar'
    else ctx_value
  
  h:
    if is_not_defined ctx_value
    then if true = true
      then @h . a
      else if true = true
        then if @h . c != not_applicable
          then @h . c
          else @h . b
        else not_applicable
    else ctx_value
  
  h . a:
    if is_not_defined ctx_value
    then 'foo'
    else ctx_value
  
  h . b:
    if is_not_defined ctx_value
    then 'bar'
    else ctx_value
  
  h . c:
    if is_not_defined ctx_value
    then 'toot'
    else ctx_value
  
  i:
    if is_not_defined ctx_value
    then if true = true
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
    else ctx_value
  
  i . a:
    if is_not_defined ctx_value
    then 'foo'
    else ctx_value
  
  i . b:
    if is_not_defined ctx_value
    then 'bar'
    else ctx_value
  
  i . c:
    if is_not_defined ctx_value
    then 'super'
    else ctx_value
  
  i . d:
    if is_not_defined ctx_value
    then 'toot'
    else ctx_value
  
  test a:
    if is_not_defined ctx_value
    then @a = 42.
    else ctx_value
  
  test b:
    if is_not_defined ctx_value
    then @b = Shared_ast.Day {day = 11; year = 2000; month = 1}
    else ctx_value
  
  test c:
    if is_not_defined ctx_value
    then @c = "foo"
    else ctx_value
  
  test d:
    if is_not_defined ctx_value
    then @d = 'foo'
    else ctx_value
  
  test e:
    if is_not_defined ctx_value
    then @e = 'bar'
    else ctx_value
  
  test f:
    if is_not_defined ctx_value
    then @f = 'toot'
    else ctx_value
