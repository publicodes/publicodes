Should correctly parse rules from stdin:

  $ echo "result: 10 + 2" | publicodes compile -t debug_eval_tree - -o -
  result:
    10. + 2.
	a:
		valeur: 10

FIXME: Should correctly report errors from stdin files:

  $ echo "result: 10 + oui" | publicodes compile - -o -
  
  E023 types non cohérents entre eux [type error]
  <no
  source
  available>
  <no
  source
  available>
  
  [123]
