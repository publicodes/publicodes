Ok :
  $ publicodes compile -t debug_eval_tree ok_simple -o -
  a:
    @b + 10.
  
  b:
    root_finding(@b, [@a], -1000000., 100000000., 0.1)

Ok :
  $ publicodes compile -t debug_eval_tree ok_verbose -o -
  a:
    @b + 10.
  
  b:
    root_finding(@b, [@a], 0., 100000., 0.1)

Ok :
  $ publicodes compile -t debug_eval_tree ok_array -o -
  a:
    @b + 10.
  
  b:
    root_finding(@b, [@a], -1000000., 100000000., 0.1)

Ok :
  $ publicodes compile -t debug_eval_tree ok_context_1 -o -
  a:
    with: {
      b = 10.
    } in
    @b + (@c + (@d + 10.))
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  d:
    with: {
      c = 10.
    } in
    root_finding(@d, [@a], 0., 100000., 0.1)

Ok :
  $ publicodes compile -t debug_eval_tree ok_context_2 -o -
  a:
    with: {
      c = 15.
    } in
    @c + 10.
  
  b:
    @c + 10.
  
  c:
    root_finding(@c, [@b], 0., 100000., 0.1)

Nak not root :
  $ publicodes compile nak_not_root -o - | ../../../scripts/get_functions.awk
  
  E020 cette règle n'existe pas [syntax error]
       ╒══  nak_not_root/rules.publicodes:1:4 ══
     1 │ a: b + 10
       │    ˘˘
   Hint: Ajoutez la règle `b` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle
  
  E017 mécanisme invalide [syntax error]
       ╒══  nak_not_root/rules.publicodes:4:5 ══
     3 │   valeur:
     4 │     inversion numérique:
       │     ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Ce mécanisme ne peut se trouver qu'à la racine
         d'une rêgle.

Nak not used :
  $ publicodes compile nak_not_used -o - | ../../../scripts/get_functions.awk
  
  E042
  la rêgle 'a' fournie pour résoudre l'inversion numérique ne dépends pas en retour de la rêgle 'b'
  [syntax error]
       ╒══  nak_not_used/rules.publicodes:5:9 ══
     4 │     avec:
     5 │       - a
       │         ˘
  
Nak not used :
  $ publicodes compile nak_not_used2 -o - | ../../../scripts/get_functions.awk
  
  E042
  la rêgle 'a' fournie pour résoudre l'inversion numérique ne dépends pas en retour de la rêgle 'b'
  [syntax error]
       ╒══  nak_not_used2/rules.publicodes:8:9 ══
     7 │     avec:
     8 │       - a
       │         ˘
  

Nak real cycle :
  $ publicodes compile nak_real_cycle -o - | ../../../scripts/get_functions.awk
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  nak_real_cycle/rules.publicodes:2:11 ══
     1 │ a:
     2 │   valeur: b + 10
       │           ˘˘ règle 'b' référencée ici
       ╒══  nak_real_cycle/rules.publicodes:9:12 ══
     8 │     max: 100000
     9 │   plafond: a # real cycle
       │            ˘˘ règle 'a' référencée de nouveau
  
