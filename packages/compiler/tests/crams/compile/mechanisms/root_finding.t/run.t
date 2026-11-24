Ok :
  $ publicodes compile -t debug_eval_tree ok_simple -o -
  a:
    if is_not_defined ctx_value
    then @b + 10.
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then root_finding(@b, [@a], -1000000., 100000000., 0.1)
    else ctx_value

Ok :
  $ publicodes compile -t debug_eval_tree ok_verbose -o -
  a:
    if is_not_defined ctx_value
    then @b + 10.
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then root_finding(@b, [@a], 0., 100000., 0.1)
    else ctx_value

Ok :
  $ publicodes compile -t debug_eval_tree ok_array -o -
  a:
    if is_not_defined ctx_value
    then @b + 10.
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then root_finding(@b, [@a], -1000000., 100000000., 0.1)
    else ctx_value

Ok :
  $ publicodes compile -t debug_eval_tree ok_context_1 -o -
  a:
    with: {
      b = 10.
    } in
    if is_not_defined ctx_value
    then @b + (@c + (@d + 10.))
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then get_context(b)
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then get_context(c)
    else ctx_value
  
  d:
    with: {
      c = 10.
    } in
    if is_not_defined ctx_value
    then root_finding(@d, [@a], 0., 100000., 0.1)
    else ctx_value

Ok :
  $ publicodes compile -t debug_eval_tree ok_context_2 -o -
  a:
    with: {
      c = 15.
    } in
    if is_not_defined ctx_value
    then @c + 10.
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then @c + 10.
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then root_finding(@c, [@b], 0., 100000., 0.1)
    else ctx_value

Ok :
  $ publicodes compile --default-to-public ok_params -o - | ../../../scripts/get_params.awk
    'a':
      params: ['b',
               'd',
               'e'],
    'b':
      params: ['a',
               'd',
               'e'],
    'c':
      params: ['a',
               'b',
               'e'],
    'd':
      params: ['a',
               'b',
               'e'],
    'e':
      params: ['e'],
    'f':
      params: ['b',
               'd',
               'e'],
    'g':
      params: ['a',
               'b',
               'e'],

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
  
