valid simple make not applicable :

  $ publicodes compile simple.publicodes  -t debug_eval_tree -o -
  a :
  get_context(a)
  
  b :
  get_context(b)
  
  x :
  if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
  then @b
  else not_applicable


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
  if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
  then if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
    then if (@c = not_applicable) || ((is_not_defined @c) || (@c = false))
      then @x
      else not_applicable
    else not_applicable
  else not_applicable

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
  if (if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @b
    else not_applicable = not_applicable) || ((is_not_defined if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @b
    else not_applicable) || (if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @b
    else not_applicable = false))
  then @c
  else not_applicable



make not applicable in / except in :

  $ publicodes compile dans_sauf_dans.publicodes  -t debug_eval_tree -o -
  a :
  get_context(a)
  
  b :
  get_context(b)
  
  c :
  get_context(c)
  
  x :
  if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
  then @c
  else not_applicable
  
  y :
  @c
  
  z :
  if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
  then @c
  else not_applicable


Multiple definitions

  $ publicodes compile multiple_definitions.publicodes  -t debug_eval_tree -o -
  a :
  get_context(a)
  
  b :
  get_context(b)
  
  c :
  if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
  then @b
  else not_applicable
  
  x :
  @c
  
  y :
  if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
  then @c
  else not_applicable + if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
  then @x
  else not_applicable


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
  if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
  then if @a != not_applicable
    then @a
    else @c
  else not_applicable
