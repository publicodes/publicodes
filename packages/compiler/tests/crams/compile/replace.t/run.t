valid simple replacement :

  $ publicodes compile replace  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then 4.
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 5.
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then get_context(c)
    else ctx_value
  
  d:
    if is_not_defined ctx_value
    then get_context(d)
    else ctx_value
  
  x:
    if is_not_defined ctx_value
    then if @a != not_applicable
      then @a
      else @b
    else ctx_value
  
  y:
    if is_not_defined ctx_value
    then if @c != not_applicable
      then @c
      else @d
    else ctx_value



replacement with cycle :

  $ publicodes compile cycle  -t debug_eval_tree -o -
  
  E027 cycle de dépendance détecté [cycle warning]
  <no
  source
  available>
   Hint: c -> a -> b -> c
  [123]



transitivity in replacement :

  $ publicodes compile transitivity  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then 4.
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 5.
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then get_context(c)
    else ctx_value
  
  x:
    if is_not_defined ctx_value
    then if if @a != not_applicable
        then @a
        else @b != not_applicable
      then if @a != not_applicable
        then @a
        else @b
      else @c
    else ctx_value


transitivity in replacement and exclusivity :

  $ publicodes compile transitivity_and_exclusivity  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then 10.
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 5.
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then 10.
    else ctx_value
  
  c prime:
    if (is_not_defined @c != not_applicable) || (((@c != not_applicable) = false) || ((@c != not_applicable) = not_applicable))
    then if is_not_defined ctx_value
      then 15.
      else ctx_value
    else not_applicable
  
  x:
    if is_not_defined ctx_value
    then if exclusive_replacement(@b, [@c prime, @c]) != not_applicable
      then exclusive_replacement(@b, [@c prime, @c])
      else @a
    else ctx_value


replacement dans / sauf dans :

  $ publicodes compile dans_sauf_dans  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then get_context(a)
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then get_context(b)
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then get_context(c)
    else ctx_value
  
  x:
    if is_not_defined ctx_value
    then if @b != not_applicable
      then @b
      else @c
    else ctx_value
  
  y:
    if is_not_defined ctx_value
    then @c
    else ctx_value
  
  z:
    if is_not_defined ctx_value
    then if @a != not_applicable
      then @a
      else @c
    else ctx_value


Multiple definitions :

  $ publicodes compile multiple_definitions  -t debug_eval_tree -o -
  
  E017 mécanisme invalide [syntax error]
       ╒══  multiple_definitions/rules.publicodes:3:7 ══
     2 │   remplace:
     3 │     - références à:
       │       ˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Une seule règle peut être référencée à la
         fois dans un « références à »
   Hint: Utilisez plusieurs « références à: » au sein
         du « remplace » pour remplacer plusieurs règles
  [123]

Multiple definitions v2 :

  $ publicodes compile multiple_definitions_v2  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then get_context(a)
    else ctx_value
  
  a':
    if (is_not_defined true) || ((true = false) || (true = not_applicable))
    then if is_not_defined ctx_value
      then get_context(a')
      else ctx_value
    else not_applicable
  
  b:
    if is_not_defined ctx_value
    then get_context(b)
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then exclusive_replacement(@b, [@a', @a])
    else ctx_value
  
  x:
    if is_not_defined ctx_value
    then @c
    else ctx_value
  
  y:
    if is_not_defined ctx_value
    then if @a != not_applicable
      then @a
      else @c + if @a != not_applicable
      then @a
      else @x
    else ctx_value

Type mismatch :

  $ publicodes compile type_mismatch  -t debug_eval_tree -o -
  
  E025 unités non compatibles [type error]
       ╒══  type_mismatch/rules.publicodes:2:11 ══
     1 │ a:
     2 │   valeur: 4 €
       │           ˘˘˘ unité: €
       ╒══  type_mismatch/rules.publicodes:5:4 ══
     4 │ 
     5 │ b: 5 mois
       │    ˘˘˘˘˘˘ unité: mois
  
  [123]


Multiple replace exclusive :

  $ publicodes compile multiple_replace_exclusive  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then 10.
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 5.
    else ctx_value
  
  c:
    if (is_not_defined @b != not_applicable) || (((@b != not_applicable) = false) || ((@b != not_applicable) = not_applicable))
    then if is_not_defined ctx_value
      then 10.
      else ctx_value
    else not_applicable
  
  x:
    if is_not_defined ctx_value
    then exclusive_replacement(@a, [@c, @b])
    else ctx_value


Multipe replace non exclusive :

  $ publicodes compile multiple_replace_non_exclusive  -t debug_eval_tree -o -
  
  E028 remplacement multiples [replace error]
       ╒══  multiple_replace_non_exclusive/rules.publicodes:10:19 ══
     9 │   remplace:
    10 │     références à: a
       │                   ˘ ici
       ╒══  multiple_replace_non_exclusive/rules.publicodes:5:19 ══
     4 │   remplace:
     5 │     références à: a
       │                   ˘ ici
   Hint: Plusieurs remplacements pour la même règle
         détectés.
   Hint: Utilisez des « remplace » chainés s'il est
         question de priorité métier ou ajoutez un attribut « exclusif: oui
         »
  [123]

Multiple replace unrespected exclusivity :

  $ publicodes compile multiple_replace_unrespected_exclusive  -t debug_eval_tree -o -
  a:
    if is_not_defined ctx_value
    then 10.
    else ctx_value
  
  b:
    if is_not_defined ctx_value
    then 5.
    else ctx_value
  
  c:
    if is_not_defined ctx_value
    then 10.
    else ctx_value
  
  x:
    if is_not_defined ctx_value
    then exclusive_replacement(@a, [@c, @b])
    else ctx_value

Multipe replace with only one missing exclusivity attribute:

  $ publicodes compile multiple_replace_one_missing_exclusive  -t debug_eval_tree -o -
  
  E028 remplacement multiples [replace error]
       ╒══  multiple_replace_one_missing_exclusive/rules.publicodes:13:19 ══
    12 │   remplace:
    13 │     références à: a
       │                   ˘ ici
   Hint: Plusieurs remplacements pour la même règle
         détectés.
   Hint: Utilisez des « remplace » chainés s'il est
         question de priorité métier ou ajoutez un attribut « exclusif: oui
         »
  [123]

cross-graph cycle (remplace + rend non applicable) — must be detected, not hang :

  $ publicodes compile cross-cycle -o -
  
  E027 cycle de dépendance détecté [cycle warning]
  <no
  source
  available>
   Hint: a -> b -> a
  [123]
