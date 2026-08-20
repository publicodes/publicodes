valid simple make not applicable :

  $ publicodes compile simple  -t debug_eval_tree -o -
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  x:
    if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @b
    else not_applicable


multiple on same rule ok :

  $ publicodes compile multiple_on_same_rule  -t debug_eval_tree -o -
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  x:
    get_context(x)
  
  y:
    if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
      then if (@c = not_applicable) || ((is_not_defined @c) || (@c = false))
        then @x
        else not_applicable
      else not_applicable
    else not_applicable

make not applicable with cycle :

  $ publicodes compile cycle  -t debug_eval_tree -o -
  
  E027 cycle de dépendance détecté [cycle warning]
  <no
  source
  available>
   Hint: c -> a -> b -> c
  [123]



transitivity in make not applicable :

  $ publicodes compile transitivity  -t debug_eval_tree -o -
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  x:
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

  $ publicodes compile dans_sauf_dans  -t debug_eval_tree -o -
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    get_context(c)
  
  x:
    if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
    then @c
    else not_applicable
  
  y:
    @c
  
  z:
    if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @c
    else not_applicable


Multiple definitions

  $ publicodes compile multiple_definitions  -t debug_eval_tree -o -
  a:
    get_context(a)
  
  b:
    get_context(b)
  
  c:
    if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @b
    else not_applicable
  
  x:
    @c
  
  y:
    if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @c
    else not_applicable + if (@a = not_applicable) || ((is_not_defined @a) || (@a = false))
    then @x
    else not_applicable


Type error

  $ publicodes compile type_error  -t debug_eval_tree -o -
  
  E023 types non cohérents entre eux [type error]
       ╒══  type_error/rules.publicodes:2:24 ══
     1 │ a:
     2 │   rend non applicable: b
       │                        ˘ est n'importe quel booléan
       ╒══  type_error/rules.publicodes:3:11 ══
     2 │   rend non applicable: b
     3 │   valeur: 6
       │           ˘ est le nombre 6.
  
  [123]

Rend non applicable take precedence over remplace

  $ publicodes compile remplace_and_make_not_applicable  -t debug_eval_tree -o -
  a:
    true
  
  b:
    true
  
  c:
    get_context(c)
  
  x:
    if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
    then if @a != not_applicable
      then @a
      else @c
    else not_applicable

Rend non applicable take precedence over exclusive remplace

  $ publicodes compile multiple_remplace_and_make_not_applicable  -t debug_eval_tree -o -
  a:
    true
  
  a':
    false
  
  b:
    true
  
  c:
    get_context(c)
  
  x:
    if (@b = not_applicable) || ((is_not_defined @b) || (@b = false))
    then exclusive_replacement(@c, [@a', @a])
    else not_applicable

Applicabilité étendue à l'espace de nom :

  $ publicodes compile namespace_applicability --without-trace -o -  | ../../scripts/get_functions.awk
  
  function _a(ctx, params) {
    return /** @type {unknown} */ (
      $get("a", ctx, params)
    )
  
  function _a_·_b(ctx, params) {
    return /** @type {42.000000} */ (
      $cond(
        $eq(
          $ref("a", _a, ctx, params),
          NotApplicable), () => NotApplicable, () => 42.)
    )
  
  function _a1(ctx, params) {
    return /** @type {unknown} */ (
      $get("a1", ctx, params)
    )
  
  function _a1_·_b1(ctx, params) {
    return /** @type {42.000000} */ (
      $cond(
        $eq(
          $cond(
            $or(
              $eq(
                $ref("c1", _c1, ctx, params),
                NotApplicable),
              () => $or(
                (isNotDefined($ref("c1", _c1, ctx, params))),
                () => $eq(
                  $ref("c1", _c1, ctx, params),
                  false))), () => $ref("a1", _a1, ctx, params), () => NotApplicable),
          NotApplicable), () => NotApplicable, () => 42.)
    )
  
  function _c1(ctx, params) {
    return /** @type {true} */ (
      true
    )
