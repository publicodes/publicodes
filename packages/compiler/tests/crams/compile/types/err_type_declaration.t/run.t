Should allow to specify type with `type` key:
(FIXME: should have better positions for the rule `c`)

  $ publicodes compile ./input/ -o -
  
  E015 mauvaise valeure [syntax error]
       ╒══  ./input/rules.publicodes:20:13 ══
    19 │     symbol:
    20 │       type: 'foo'
       │             ˘˘˘˘˘ Les types valides sont `texte`, `booléen`, `date` ou `nombre`.
  
  
  E015 mauvaise valeure [syntax error]
       ╒══  ./input/rules.publicodes:23:13 ══
    22 │     number:
    23 │       type: 10
       │             ˘˘ Les types valides sont `texte`, `booléen`, `date` ou `nombre`.
  
  
  E015 mauvaise valeure [syntax error]
       ╒══  ./input/rules.publicodes:26:13 ══
    25 │     texte:
    26 │       type: "foo"
       │             ˘˘˘˘˘ Les types valides sont `texte`, `booléen`, `date` ou `nombre`.
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./input/rules.publicodes:13:9 ══
    12 │ not compatible type should fail:
    13 │   type: texte
       │         ˘˘˘˘˘ est un texte
       ╒══  ./input/rules.publicodes:14:11 ══
    13 │   type: texte
    14 │   valeur: 10 > 2
       │           ˘˘˘˘˘˘ est un booléan
  
  [123]

