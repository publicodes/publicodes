valid simple replacement :

  $ publicodes compile replace  -t debug_eval_tree -o -
  a:
    4.
  
  b:
    5.
  
  c:
    get_context(c)
  
  d:
    get_context(d)
  
  x:
    if @a != not_applicable
    then @a
    else @b
  
  y:
    if @c != not_applicable
    then @c
    else @d



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
    4.
  
  b:
    5.
  
  c:
    get_context(c)
  
  x:
    if if @a != not_applicable
      then @a
      else @b != not_applicable
    then if @a != not_applicable
      then @a
      else @b
    else @c


transitivity in replacement and exclusivity :

  $ publicodes compile transitivity_and_exclusivity  -t debug_eval_tree -o -
  a:
    10.
  
  b:
    5.
  
  c:
    10.
  
  c prime:
    if (is_not_defined @c != not_applicable) || (((@c != not_applicable) = false) || ((@c != not_applicable) = not_applicable))
    then 15.
    else not_applicable
  
  x:
    if if @c != not_applicable
      then @c
      else if @c prime != not_applicable
        then @c prime
        else @b != not_applicable
    then if @c != not_applicable
      then @c
      else if @c prime != not_applicable
        then @c prime
        else @b
    else @a


replacement dans / sauf dans :

  $ publicodes compile dans_sauf_dans  -t debug_eval_tree -o -
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  x:
    if @b != not_applicable
    then @b
    else @c
  
  y:
    @c
  
  z:
    if @a != not_applicable
    then @a
    else @c


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
         du « remplace » pour cibler plusieurs règles pour remplacer
         plusieurs règles
  [123]

Multiple definitions v2 :

  $ publicodes compile multiple_definitions_v2  -t debug_eval_tree -o -
  a:
    get_context(a)
  
  a':
    if (is_not_defined true) || ((true = false) || (true = not_applicable))
    then get_context(a')
    else not_applicable
  
  b:
    get_context(b)
  
  c:
    if @a != not_applicable
    then @a
    else if @a' != not_applicable
      then @a'
      else @b
  
  x:
    @c
  
  y:
    if @a != not_applicable
    then @a
    else @c + if @a != not_applicable
    then @a
    else @x

Type mismatch :

  $ publicodes compile type_mismatch  -t debug_eval_tree -o -
  
  E025 unités non compatibles [type error]
       ╒══  type_mismatch/rules.publicodes:5:4 ══
     4 │ 
     5 │ b: 5 mois
       │    ˘˘˘˘˘˘ unité: mois
       ╒══  type_mismatch/rules.publicodes:2:11 ══
     1 │ a:
     2 │   valeur: 4 €
       │           ˘˘˘ unité: €
  
  [123]


Multiple replace exclusive :

  $ publicodes compile multiple_replace_exclusive  -t debug_eval_tree -o -
  a:
    10.
  
  b:
    5.
  
  c:
    if (is_not_defined @b != not_applicable) || (((@b != not_applicable) = false) || ((@b != not_applicable) = not_applicable))
    then 10.
    else not_applicable
  
  x:
    if @b != not_applicable
    then @b
    else if @c != not_applicable
      then @c
      else @a

Multipe replace non exclusive :

  $ publicodes compile multiple_replace_non_exclusive  -t debug_eval_tree -o -
  
  E028 remplacement multiples [replace error]
       ╒══  multiple_replace_non_exclusive/rules.publicodes:10:19 ══
     9 │   remplace:
    10 │     références à: a
       │                   ˘ Si vous souhaitez assumer cette exclusivité, veuillez utiliser « exclusif: oui » 
       ╒══  multiple_replace_non_exclusive/rules.publicodes:5:19 ══
     4 │   remplace:
     5 │     références à: a
       │                   ˘ Si vous souhaitez assumer cette exclusivité, veuillez utiliser « exclusif: oui » 
   Hint: Plusieurs remplacements pour la même règle
         détectés.
   Hint: Utilisez des « remplace » chainés s'il est
         question de priorité métier.
  [123]

Multiple replace unrespected exclusivity :

  $ publicodes compile multiple_replace_unrespected_exclusive  -t debug_eval_tree -o -
  a:
    10.
  
  b:
    5.
  
  c:
    10.
  
  x:
    if @b != not_applicable
    then @b
    else if @c != not_applicable
      then @c
      else @a

Multipe replace with only one missing exclusivity attribute:

  $ publicodes compile multiple_replace_one_missing_exclusive  -t debug_eval_tree -o -
  
  E028 remplacement multiples [replace error]
       ╒══  multiple_replace_one_missing_exclusive/rules.publicodes:13:19 ══
    12 │   remplace:
    13 │     références à: a
       │                   ˘ Si vous souhaitez assumer cette exclusivité, veuillez utiliser « exclusif: oui » 
   Hint: Plusieurs remplacements pour la même règle
         détectés.
   Hint: Utilisez des « remplace » chainés s'il est
         question de priorité métier.
  [123]
