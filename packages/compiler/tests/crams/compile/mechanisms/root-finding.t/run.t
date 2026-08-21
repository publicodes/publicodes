Ok puissance :
  $ publicodes compile ok -o - | ../../../scripts/get_functions.awk
  
  function _a(ctx, params) {
    return /** @type {number} */ (
      $ret("f2ab7fef1644f072e1c495a89baa5534", ctx, $add(
        $ret("c83f417767965172653528f51c8d8ef1", ctx, $ref("b", _b, ctx, params)),
        $ret("bb83c379ed7eccdd94d6cb99b29d4692", ctx, 10.)))
    )
  
  function _b(ctx, params) {
    return /** @type {number} */ (
      $ret("5a21f517fcd13a275d10a5ace9160050", ctx, $root_finding("b", [["a", _a]], 0., 100000., 0.1, ctx, params))
    )

Ok puissance :
  $ publicodes compile ok2 -o - | ../../../scripts/get_functions.awk
  
  function _a(ctx, params) {
    return /** @type {number} */ (
      $ret("6272d6c00b58b1dd14631981743e6874", ctx, $add(
        $ret("78d5d2fd42163708d1ef6d21bc650a5d", ctx, $ref("b", _b, ctx, params)),
        $ret("cfbe425174675a43df450ce57d201c0c", ctx, 10.)))
    )
  
  function _b(ctx, params) {
    return /** @type {number} */ (
      $ret("d1d4746fa41036d441e1828496ec8909", ctx, $root_finding("b", [["a", _a]], -1000000., 100000000., 0.1, ctx, params))
    )

Ok puissance :
  $ publicodes compile ok3 -o - | ../../../scripts/get_functions.awk
  
  function _a(ctx, params) {
    return /** @type {number} */ (
      $ret("acd054b195c804625df475902440cdac", ctx, $add(
        $ret("7c77e445b75dafeebf3ef4b373621ee0", ctx, $ref("b", _b, ctx, params)),
        $ret("234b28d3cd34d072a3a97d296b88c088", ctx, 10.)))
    )
  
  function _b(ctx, params) {
    return /** @type {number} */ (
      $ret("1782e7a548de69c4eef9d81c590a7068", ctx, $root_finding("b", [["a", _a]], -1000000., 100000000., 0.1, ctx, params))
    )

# TODO
# Ok puissance :
#   $ publicodes compile ok4 -o - | ../../../scripts/get_functions.awk

Nak not root :
  $ publicodes compile nak/not_root -o - | ../../../scripts/get_functions.awk
  
  E017 mécanisme invalide [syntax error]
       ╒══  nak/not_root/rules.publicodes:4:5 ══
     3 │   valeur:
     4 │     inversion numérique:
       │     ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Une inversion numérique ne peut se trouver qu'à
         la racine d'une rêgle.
  
  E020 cette règle n'existe pas [syntax error]
       ╒══  nak/not_root/rules.publicodes:1:4 ══
     1 │ a: b + 10
       │    ˘˘
   Hint: Ajoutez la règle `b` manquante
   Hint: Vérifiez les erreurs de typos dans le nom de la
         règle

Nak not used :
  $ publicodes compile nak/not_used -o - | ../../../scripts/get_functions.awk
  
  E042
  la rêgle fournie pour résoudre l'inversion numérique ne dépends pas en retour de la rêgle
  [syntax error]
       ╒══  nak/not_used/rules.publicodes:6:9 ══
     5 │     avec:
     6 │       - a
       │         ˘
  

# TODO
# Nak not used :
#   $ publicodes compile nak/not_used2 -o - | ../../../scripts/get_functions.awk

Nak double dependency :
  $ publicodes compile nak/double_dep -o - | ../../../scripts/get_functions.awk
  
  function _a(ctx, params) {
    return /** @type {number} */ (
      $ret("3d0d8a947ed05c50850db57629e78465", ctx, $add(
        $ret("e9054e1b606e42173ce7d61205faa71c", ctx, $ref("b", _b, ctx, params)),
        $ret("1de4adb2ec1cabc59ed56bb750219181", ctx, $add(
          $ret("171defd3d3c14cef932b00afc0682e20", ctx, $ref("c", _c, ctx, params)),
          $ret("91fdc128678bdf292c94bd8a529c9c5a", ctx, 10.)))))
    )
  
  function _b(ctx, params) {
    return /** @type {number} */ (
      $ret("086f7545eb7b4b74d4b4194f96a153e3", ctx, $get("b", ctx, params))
    )
  
  function _c(ctx, params) {
    return /** @type {number} */ (
      $ret("9a7073669be00f07cd23a4a9322d40fe", ctx, $root_finding("c", [["a", _a]], 0., 100000., 0.1, ctx, params))
    )
