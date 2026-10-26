Should fail with type mismatch errors:

  $ publicodes compile ./input -o -
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:3:13
    1 │  string lit: "Test"
      │              ˘˘˘˘˘˘ est le texte "Test"
    2 │  
    3 │  number lit: 12
      │              ˘˘ est le nombre 12.
    4 │  
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:10:13
    1 │  string lit: "Test"
      │              ˘˘˘˘˘˘ est le texte "Test"
    2 │  
      ·  
    9 │  
   10 │  symbol lit: 'Test'
      │              ˘˘˘˘˘˘ est le symbole 'Test'
   11 │  
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:31:11
   29 │    avec:
   30 │      super: 'super'
      │             ˘˘˘˘˘˘˘ est le symbole 'super'
   31 │      bien: 'bien'
      │            ˘˘˘˘˘˘ est le symbole 'bien'
   32 │  
  
  [123]
