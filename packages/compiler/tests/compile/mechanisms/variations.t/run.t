Wrongly formatted variations :

  $ publicodes compile syntax_error.publicodes -o -
  E022 mécanisme invalide [syntax error]
       ╒══  syntax_error.publicodes:8:3 ══
     7 │ b:
     8 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: Variation should have 'si' and 'alors' keys
  E022 mécanisme invalide [syntax error]
       ╒══  syntax_error.publicodes:14:3 ══
    13 │ c:
    14 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: Variation should have 'si' and 'alors' keys
  E022 mécanisme invalide [syntax error]
       ╒══  syntax_error.publicodes:20:3 ══
    19 │ d:
    20 │   variations:
       │   ˘˘˘˘˘˘˘˘˘˘˘
   Hint: Il doit y avoir au moins une variation en plus de
         la clause « sinon »
  {
    "evaluation": [
      [ 1, 4, 7 ],
      [ "||", 2, 5 ],
      [ "=", 3, 4 ],
      true,
      null,
      [ "=", 3, 6 ],
      false,
      200.0
    ],
    "outputs": {}
  }
  [123]
