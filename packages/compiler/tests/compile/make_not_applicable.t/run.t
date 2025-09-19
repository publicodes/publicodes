valid simple make not applicable :

  $ publicodes compile simple.publicodes  -t debug_eval_tree -o -
  a :
  get_context(a)
  
  b :
  get_context(b)
  
  x :
  if (@a = null) || ((is_undef @a) || (@a = false))
  then @b
  else null


multiple on same rule ok :

  $ publicodes compile multiple_on_same_rule.publicodes  -t debug_eval_tree -o -
  a :
  get_context(a)
  
  b :
  get_context(b)
  
  c :
  get_context(c)
  
  x :
  get_context(x)
  
  y :
  if (@a = null) || ((is_undef @a) || (@a = false))
  then
    if (@b = null) || ((is_undef @b) || (@b = false))
    then
      if (@c = null) || ((is_undef @c) || (@c = false))
      then @x
      else null
    else null
  else null

make not applicable with cycle :

  $ publicodes compile cycle.publicodes  -t debug_eval_tree -o -
  E027 cycle de dépendance détecté [cycle warning]
  <no
  source
  available>
   Hint: c -> a -> b -> c
  [123]



transitivity in make not applicable :

  $ publicodes compile transitivity.publicodes  -t debug_eval_tree -o -
  a :
  get_context(a)
  
  b :
  get_context(b)
  
  c :
  get_context(c)
  
  x :
  if (if (@a = null) || ((is_undef @a) || (@a = false))
                              then @b
                              else null = null) || ((is_undef if (@a = null) || ((is_undef @a) || (@a = false))
                                                                      then
                                                                      @b
                                                                      else
                                                                      null) || (if (@a = null) || ((is_undef @a) || (@a = false))
                                                                      then
                                                                      @b
                                                                      else
                                                                      null = false))
  then @c
  else null



make not applicable in / except in :

  $ publicodes compile dans_sauf_dans.publicodes  -t debug_eval_tree -o -
  a :
  get_context(a)
  
  b :
  get_context(b)
  
  c :
  get_context(c)
  
  x :
  if (@b = null) || ((is_undef @b) || (@b = false))
  then @c
  else null
  
  y :
  @c
  
  z :
  if (@a = null) || ((is_undef @a) || (@a = false))
  then @c
  else null


Multiple definitions

  $ publicodes compile multiple_definitions.publicodes  -t debug_eval_tree -o -
  a :
  get_context(a)
  
  b :
  get_context(b)
  
  c :
  if (@a = null) || ((is_undef @a) || (@a = false))
  then @b
  else null
  
  x :
  @c
  
  y :
  if (@a = null) || ((is_undef @a) || (@a = false))
  then @c
  else null + if (@a = null) || ((is_undef @a) || (@a = false))
                                         then @x
                                         else null


Type error

  $ publicodes compile type_error.publicodes  -t debug_eval_tree -o -
  E023 types non cohérents entre eux [type error]
       ╒══  type_error.publicodes:7:4 ══
     6 │ 
     7 │ c: b
       │    ˘ est un booléen (oui / non)
       ╒══  type_error.publicodes:3:11 ══
     2 │   rend non applicable: b
     3 │   valeur: 6
       │           ˘ est un nombre 
  
  [123]

Rend non applicable take precedence over remplace

  $ publicodes compile remplace_and_make_not_applicable.publicodes  -t debug_eval_tree -o -
  a :
  true
  
  b :
  true
  
  c :
  get_context(c)
  
  x :
  if (@b = null) || ((is_undef @b) || (@b = false))
  then
    if @a != null
    then @a
    else @c
  else null
