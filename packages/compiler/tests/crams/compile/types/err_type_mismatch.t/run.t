Should fail with type mismatch errors:

  $ publicodes compile ./input -o -
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:6:11
    5 │  can't compare string with number écordè:
    6 │    valeur: string lit > number lit
      │            ^^^^^^^^^^   ˘˘˘˘˘˘˘˘˘˘ est le nombre 12.
      │            │
      │            est le texte "Test"
    7 │  
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:13:11
   12 │  can't compare string with symbol:
   13 │    valeur: string lit = symbol lit
      │            ^^^^^^^^^^   ˘˘˘˘˘˘˘˘˘˘ est le symbole 'Test'
      │            │
      │            est le texte "Test"
   14 │  
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:28:11
   27 │  can't compare two literals with different values:
   28 │    valeur: super = bien
      │            ^^^^^   ˘˘˘˘ est le symbole 'bien'
      │            │
      │            est le symbole 'super'
   29 │    avec:
  
  [123]
