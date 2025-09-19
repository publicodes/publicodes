valid simple replacement :

  $ publicodes compile replace.publicodes  -t debug_eval_tree -o -
  a :
  4.
  
  b :
  5.
  
  c :
  get_context(c)
  
  d :
  get_context(d)
  
  x :
  if @a != null
  then @a
  else @b
  
  y :
  if @c != null
  then @c
  else @d



same priority warning :

  $ publicodes compile same_priority.publicodes  -t debug_eval_tree -o -
  E028 remplacement multiples [replace error]
       ╒══  same_priority.publicodes:8:13 ══
     7 │ c:
     8 │   remplace: b
       │             ˘ Priorité 0
       ╒══  same_priority.publicodes:2:13 ══
     1 │ a:
     2 │   remplace: b
       │             ˘ Priorité 0
   Hint: plusieurs remplacement avec la même priorité
         détecté
   Hint: modifier la priorité avec : 
         remplace: 
             références à: ... 
             priorité: <nombre>
  [123]

replacement with cycle :

  $ publicodes compile cycle.publicodes  -t debug_eval_tree -o -
  E027 cycle de dépendance détecté [cycle warning]
  <no
  source
  available>
   Hint: c -> a -> b -> c
  [123]



transitivity in replacement :

  $ publicodes compile transitivity.publicodes  -t debug_eval_tree -o -
  a :
  4.
  
  b :
  5.
  
  c :
  get_context(c)
  
  x :
  if if @a != null
              then @a
              else @b != null
  then
    if @a != null
    then @a
    else @b
  else @c


replacement dans / sauf dans :

  $ publicodes compile dans_sauf_dans.publicodes  -t debug_eval_tree -o -
  a :
  get_context(a)
  
  b :
  get_context(b)
  
  c :
  get_context(c)
  
  x :
  if @b != null
  then @b
  else @c
  
  y :
  @c
  
  z :
  if @a != null
  then @a
  else @c

Multiples remplacements avec priorité différentes :

  $ publicodes compile multiple_replacements.publicodes  -t debug_eval_tree -o -
  a :
  4.
  
  b :
  5.
  
  c :
  get_context(c)
  
  x :
  if @a != null
  then @a
  else
    if @c != null
    then @c
    else @b

Multiple definitions

  $ publicodes compile multiple_definitions.publicodes  -t debug_eval_tree -o -
  a :
  get_context(a)
  
  b :
  get_context(b)
  
  c :
  if @a != null
  then @a
  else @b
  
  x :
  @c
  
  y :
  if @a != null
  then @a
  else @c + if @a != null
                                                  then
                                                    @a
                                                  else
                                                    @x

Type mismatch

  $ publicodes compile type_mismatch.publicodes  -t debug_eval_tree -o -
  E025 unités non compatibles [type error]
       ╒══  type_mismatch.publicodes:5:4 ══
     4 │ 
     5 │ b: 5 mois
       │    ˘˘˘˘˘˘ unité: mois
       ╒══  type_mismatch.publicodes:2:11 ══
     1 │ a:
     2 │   valeur: 4 €
       │           ˘˘˘ unité: €
  
  [123]
