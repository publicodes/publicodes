Simple reference in value:

  $ publicodes compile ./ok/simple -t debug_eval_tree -o -
  b:
    get_context(b)
  
  b . a:
    @b . c
  
  b . c:
    @c
  
  c:
    5.

Should correctly resolve relative references by prioritizing direct children
over siblings:

  $ publicodes compile ./ok/relative-references -t debug_eval_tree -o -
  a:
    @a . b + (@a . c + @d)
  
  a . b:
    get_context(a . b)
  
  a . c:
    get_context(a . c)
  
  b:
    get_context(b)
  
  d:
    get_context(d)
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
