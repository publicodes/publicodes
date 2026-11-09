Simple :

  $ publicodes compile ./simple -t debug_eval_tree -o -
  impôt sur le revenu:
    scale(@revenu imposable, [[9807. €, 0. %], [27086. €, 14. %], [72617. €, 30. %], [153783. €, 41. %]], 45. %)
  
  revenu imposable:
    54126. €

Simple :

  $ publicodes compile ./typing -t debug_eval_tree -o -
  impôt sur le revenu:
    scale(@revenu imposable, [[9807., 0. %], [27086., 14. %], [72617., 30. %], [153783., 41. %]], 45. %)
  
  revenu imposable:
    54126. €

Nak typing :

  $ publicodes compile ./nak_typing -t debug_eval_tree -o -
  
  E025 unités non compatibles [type error]
       ╒══  ./nak_typing/rules.publicodes:1:19 ══
     1 │ revenu imposable: 54126 €
       │                   ˘˘˘˘˘˘˘ unité: €
       ╒══  ./nak_typing/rules.publicodes:4:3 ══
     3 │   valeur: revenu imposable
     4 │   barème:
       │   ˘˘˘˘˘˘˘ unité: $
  
  [123]

Nak two remainings :

  $ publicodes compile ./nak_two_remaining -t debug_eval_tree -o -
  
  E043
  Une seule tranche est autorisé à ne pas renseigner « plafond: »
  [syntax error]
       ╒══  ./nak_two_remaining/rules.publicodes:4:3 ══
     3 │   valeur: revenu imposable
     4 │   barème:
       │   ˘˘˘˘˘˘˘
  
  [123]

Nak not percent :

  $ publicodes compile ./nak_not_percent -t debug_eval_tree -o -
  
  E022 type invalide détecté [type error]
       ╒══  ./nak_not_percent/rules.publicodes:5:13 ══
     4 │   barème:
     5 │     - taux: 20 €
       │             ˘˘˘˘ est le nombre 20.
   Hint: taux doit être un pourcentage
  [123]
