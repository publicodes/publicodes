Should have error when type don't match

  $ publicodes compile type_error.publicodes -o -
  E023 types non cohérents entre eux [type error]
       ╒══  type_error.publicodes:3:4 ══
     2 │ 
     3 │ b: 12
       │    ˘˘ est un nombre 
       ╒══  type_error.publicodes:1:4 ══
     1 │ a: "Test"
       │    ˘˘˘˘˘˘ est un texte
  
  [123]

Should allow to specify type with `type` key

  $ publicodes compile type_key.publicodes -o -
  E023 types non cohérents entre eux [type error]
       ╒══  type_key.publicodes:9:9 ══
     8 │   valeur: a > b
     9 │   type: texte # erreur
       │         ˘˘˘˘˘˘ est un texte
       ╒══  type_key.publicodes:8:13 ══
     7 │ c:
     8 │   valeur: a > b
       │             ˘˘˘ est un booléen (oui / non)
  
  [123]
