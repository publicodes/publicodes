Should fail with type mismatch errors:

  $ publicodes compile ./input -o -
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./input/rules.publicodes:1:13 ══
     1 │ string lit: "Test"
       │             ˘˘˘˘˘˘ est le texte "Test"
       ╒══  ./input/rules.publicodes:3:13 ══
     2 │ 
     3 │ number lit: 12
       │             ˘˘ est le nombre 12.
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./input/rules.publicodes:1:13 ══
     1 │ string lit: "Test"
       │             ˘˘˘˘˘˘ est le texte "Test"
       ╒══  ./input/rules.publicodes:10:13 ══
     9 │ 
    10 │ symbol lit: 'Test'
       │             ˘˘˘˘˘˘ est le symbole 'Test'
  
  
  E023 types non cohérents entre eux [type error]
       ╒══  ./input/rules.publicodes:30:12 ══
    29 │   avec:
    30 │     super: 'super'
       │            ˘˘˘˘˘˘˘ est le symbole 'super'
       ╒══  ./input/rules.publicodes:31:11 ══
    30 │     super: 'super'
    31 │     bien: 'bien'
       │           ˘˘˘˘˘˘ est le symbole 'bien'
  
  [123]
