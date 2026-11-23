Simple reference in value:

  $ publicodes compile ./ok/simple -t debug_eval_tree -o -
  __b__a:
    if is_not_defined ctx_value
    then @b . a
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then get_context(b)
    else ctx_value
  
  b . a:
    if is_not_defined ctx_value
    then @b . c
    else ctx_value
  
  b . c:
    if is_not_defined ctx_value
    then @c
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then 5.
    else ctx_value

Should correctly resolve relative references by prioritizing direct children
over siblings:

  $ publicodes compile ./ok/relative-references -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then @a . b + (@a . c + @d)
    else ctx_value
  
  a . b:
    if is_not_defined ctx_value
    then get_context(a . b)
    else ctx_value
  
  a . c:
    if is_not_defined ctx_value
    then get_context(a . c)
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then get_context(b)
    else ctx_value
  
  d:
    if is_not_defined ctx_value
    then get_context(d)
    else ctx_value
	b:
	  get_context(b)

	b . a:
	  @b . c

	b . c:
	  @c

	c:
	  5.

Should throw an error if a reference to an non-existing rule is made:

  $ publicodes compile ./error/unknown-reference/ -o -
  
  E020 cette règle n'existe pas [syntax error]
       ╒══  ./error/unknown-reference/main.publicodes:2:11 ══
     1 │ a:
     2 │   valeur: b
       │           ˘
   Hint: Ajoutez la règle `b` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  [123]
