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
  error[E020]: la règle `b` est introuvable dans le module courant
      ╒══ ./error/unknown-reference/main.publicodes:2:11
    1 │  a:
    2 │    valeur: b
      │            ^ règle introuvable
    3 │  
      = (aide) Ajoutez la règle `b` manquante
  
  [123]


Should show a suggestion for a rule name if a reference to a non-existing rule is made:

  $ publicodes compile ./error/suggestions/ -o -
  error[E020]: la règle `parnt` est introuvable dans le module courant
      ╒══ ./error/suggestions/rules.publicodes:7:7
    6 │  
    7 │  test: parnt
      │        ^^^^^ règle introuvable
    8 │  
    9 │  test2: refrence # should suggest `output . reference`
   10 │  
   11 │  parent:
      │  ˘˘˘˘˘˘ règle similaire `parent` définie ici
   12 │    valeur: parnt # parent rule should not be suggested
  
  error[E020]: la règle `refrence` est introuvable dans le module courant
      ╒══ ./error/suggestions/rules.publicodes:9:8
    4 │    avec:
    5 │      reference: 10
      │      ˘˘˘˘˘˘˘˘˘ règle similaire `output . reference` définie ici
    6 │  
    7 │  test: parnt
    8 │  
    9 │  test2: refrence # should suggest `output . reference`
      │         ^^^^^^^^ règle introuvable
   10 │  
  
  error[E020]: la règle `parnt` est introuvable dans le module courant
      ╒══ ./error/suggestions/rules.publicodes:12:11
   11 │  parent:
   12 │    valeur: parnt # parent rule should not be suggested
      │            ^^^^^ règle introuvable
   13 │  
      = (aide) Ajoutez la règle `parnt` manquante
  
  [123]
