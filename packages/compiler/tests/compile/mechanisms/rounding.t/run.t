Bad types for arrondi :
  $ publicodes compile type_error.publicodes -t debug_eval_tree -o -
  E014 valeur manquante [syntax error]
       ╒══  type_error.publicodes:14:11 ══
    13 │   valeur: 5€
    14 │   arrondi:
       │            valeur attendue ici
  
  E025 unités non compatibles [type error]
       ╒══  type_error.publicodes:9:11 ══
     8 │ c:
     9 │   valeur: 4 $
       │           ˘˘˘ unité: $
       ╒══  type_error.publicodes:10:12 ══
     9 │   valeur: 4 $
    10 │   arrondi: 0.1 €
       │            ˘˘˘˘˘ unité: €
  
  E022 type invalide détécté [type error]
       ╒══  type_error.publicodes:14:3 ══
    13 │   valeur: 5€
    14 │   arrondi:
       │   ˘˘˘˘˘˘˘˘
   Hint: arrondi doit être un nombre ou un booléen
  E022 type invalide détécté [type error]
       ╒══  type_error.publicodes:19:12 ══
    18 │   valeur: 5€
    19 │   arrondi: x
       │            ˘
   Hint: arrondi doit être un nombre ou un booléen
  E022 type invalide détécté [type error]
       ╒══  type_error.publicodes:6:12 ══
     5 │ b:
     6 │   arrondi: 01/2025
       │            ˘˘˘˘˘˘˘
   Hint: arrondi doit être un nombre ou un booléen
  E022 type invalide détécté [type error]
       ╒══  type_error.publicodes:2:12 ══
     1 │ a:
     2 │   arrondi: "non"
       │            ˘˘˘˘˘
   Hint: arrondi doit être un nombre ou un booléen
  [123]



Ok arrondi :
  $ publicodes compile ok.publicodes -t debug_eval_tree -o -
  a :
  round to:
  if true
  then 1.
  else null
  get_context(a)
  
  arrondi à la dizaine :
  round to: 10.
  33.4167
  
  b :
  round down to: 5. €
  43. €
  
  c :
  round up to:
  10. ** (- 4. décimales)
  get_context(c)
  
  d :
  round to:
  if (@est arrondi = false) || (is_undef @est arrondi)
  then null
  else 0.1
  4.65 €
  
  est arrondi :
  get_context(est arrondi)
