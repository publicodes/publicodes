Should fail with type mismatch errors:

  $ publicodes compile ./input -o -
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:6:22
    5 │  can't compare string with number écordè:
    6 │    valeur: string lit > number lit
      │            ˘˘˘˘˘˘˘˘˘˘ ^ ˘˘˘˘˘˘˘˘˘˘ est le nombre 12.
      │            │          │
      │            │          opération invalide
      │            est le texte "Test"
    7 │  
      = (aide) l'opération `>` s'applique uniquement sur des valeurs de même type
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:13:22
   12 │  can't compare string with symbol:
   13 │    valeur: string lit = symbol lit
      │            ˘˘˘˘˘˘˘˘˘˘ ^ ˘˘˘˘˘˘˘˘˘˘ est le symbole 'Test'
      │            │          │
      │            │          opération invalide
      │            est le texte "Test"
   14 │  
      = (aide) l'opération `=` s'applique uniquement sur des valeurs de même type
  
  error[E023]: types non cohérents entre eux
      ╒══ ./input/rules.publicodes:28:17
   27 │  can't compare two literals with different values:
   28 │    valeur: super = bien
      │            ˘˘˘˘˘ ^ ˘˘˘˘ est le symbole 'bien'
      │            │     │
      │            │     opération invalide
      │            est le symbole 'super'
   29 │    avec:
      = (aide) l'opération `=` s'applique uniquement sur des valeurs de même type
  
  [123]
