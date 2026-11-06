# FIXME: should point to the inferred pos for the replacement rule.
Should raise an error:

  $ publicodes compile ./input/ -o -
  error[E041]: l'exposant d'une puissance ne devrait pas avoir d'unité
      ╒══ ./input/rules.publicodes:3:19
    2 │    public: oui
    3 │    valeur: 10 l ** 2 kg
      │                    ^^^^ unité: kg
    4 │  
  
  error[E041]: l'exposant d'une puissance ne devrait pas avoir d'unité
      ╒══ ./input/rules.publicodes:7:19
    6 │    public: oui
    7 │    valeur: 10 l ** exponent
      │                    ^^^^^^^^ unité: kg
    8 │    avec:
    9 │      exponent: 10 kg
      │                ˘˘˘˘˘ définie ici
   10 │  
  
  error[E041]: l'exposant d'une puissance ne devrait pas avoir d'unité
      ╒══ ./input/rules.publicodes:13:19
   12 │    public: oui
   13 │    valeur: 10 l ** exponent
      │                    ^^^^^^^^ unité: kg
   14 │    avec:
  
  error[E041]: l'exposant d'une puissance ne devrait pas avoir d'unité
      ╒══ ./input/rules.publicodes:22:19
   21 │    public: oui
   22 │    valeur: 10 l ** exponent
      │                    ^^^^^^^^ unité: kg
   23 │    contexte:
   24 │      exponent: 10 kg
      │                ˘˘˘˘˘ définie ici
   25 │    avec:
  
  [123]
