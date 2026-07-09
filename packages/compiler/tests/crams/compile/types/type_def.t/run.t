Should allow to specify type with `type` key:
(FIXME: should have better positions for the rule `c`)

  $ publicodes compile ./inputs/ -o -
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./inputs/rules.publicodes:9:9 ══
     8 │   valeur: a > b
     9 │   type: texte # erreur
       │         ˘˘˘˘˘˘ est un texte
       ╒══  ./inputs/rules.publicodes:8:11 ══
     7 │ c:
     8 │   valeur: a > b
       │           ˘˘˘˘˘ est un booléen (oui / non)
  
  [123]
