Should allow to specify type with `type` key:
(FIXME: should have better positions for the rule `c`)

  $ publicodes compile ./input/ -o -
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:14:11
   12 │  not compatible type should fail:
   13 │    type: texte
      │          ˘˘˘˘˘ est un texte
   14 │    valeur: 10 > 2
      │            ˘˘˘˘˘˘ est un booléan
   15 │  
  
  error[E015]: mauvaise valeure
      ╒══ ./input/rules.publicodes:20:13
   19 │      symbol:
   20 │        type: 'foo'
      │              ˘˘˘˘˘ Les types valides sont `texte`, `booléen`, `date` ou `nombre`.
   21 │  
  
  error[E015]: mauvaise valeure
      ╒══ ./input/rules.publicodes:23:13
   22 │      number:
   23 │        type: 10
      │              ˘˘ Les types valides sont `texte`, `booléen`, `date` ou `nombre`.
   24 │  
  
  error[E015]: mauvaise valeure
      ╒══ ./input/rules.publicodes:26:13
   25 │      texte:
   26 │        type: "foo"
      │              ˘˘˘˘˘ Les types valides sont `texte`, `booléen`, `date` ou `nombre`.
   27 │  
  
  [123]

