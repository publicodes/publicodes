Cycle analysis should take context into account (TODO) :

  $ publicodes compile without-cycle.publicodes -o -
  E020 cette règle n'existe pas [syntax error]
       ╒══  without-cycle.publicodes:10:9 ══
     9 │         salaire brut: 1000 €
    10 │         plafond: non
       │         ˘˘˘˘˘˘˘˘
   Hint: Ajoutez la règle `plafond` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  without-cycle.publicodes:3:3 ══
     2 │   valeur: 10% * salaire brut
     3 │   plafond: plafond
       │   ˘˘˘˘˘˘˘˘
   Hint: cotisation -> cotisation . plafond ->
         cotisation
  [123]
