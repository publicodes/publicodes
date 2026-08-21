Ok puissance :
  $ publicodes compile ok -o - | ../../../scripts/get_functions.awk
  
  function _a(ctx, params) {
    return /** @type {number} */ (
      $ret("f2ab7fef1644f072e1c495a89baa5534", ctx, $add(
        $ret("c83f417767965172653528f51c8d8ef1", ctx, $ref("b", _b, ctx, params)),
        $ret("bb83c379ed7eccdd94d6cb99b29d4692", ctx, 10.)))
    )
  
  function _a1(ctx, params) {
    return /** @type {number} */ (
      $ret("4273f95bd9cb974a5cf7a5b664986b59", ctx, $add(
        $ret("e825315a51d019c51f64b5650a61b3a9", ctx, $ref("b1", _b1, ctx, params)),
        $ret("13fbc6e3b76823bdcc1d973542aa4c7c", ctx, 10.)))
    )
  
  function _a2(ctx, params) {
    return /** @type {number} */ (
      $ret("2941d2a0fb5a0d50ce6e7d117d0d45f2", ctx, $add(
        $ret("f5b41dfe474f7c4a25f566af148f9985", ctx, $ref("b2", _b2, ctx, params)),
        $ret("4c3f51484ea041c39c54dcab8271cf68", ctx, 10.)))
    )
  
  function _b(ctx, params) {
    return /** @type {number} */ (
      $ret("5a21f517fcd13a275d10a5ace9160050", ctx, $root_finding("b", [["a", _a]], 0., 100000., 0.1, ctx, params))
    )
  
  function _b1(ctx, params) {
    return /** @type {number} */ (
      $ret("78d96fde4e126f03bddcac6c054271c4", ctx, $root_finding("b1", [["a1", _a1]], -1000000., 100000000., 0.1, ctx, params))
    )
  
  function _b2(ctx, params) {
    return /** @type {number} */ (
      $ret("e5ba414cf30e12e1016a897f718a554e", ctx, $root_finding("b2", [["a2", _a2]], -1000000., 100000000., 0.1, ctx, params))
    )

Nak not root :
  $ publicodes compile nak/not_root -o - | ../../../scripts/get_functions.awk
  
  E017 mécanisme invalide [syntax error]
       ╒══  nak/not_root/rules.publicodes:4:5 ══
     3 │   valeur:
     4 │     inversion numérique:
       │     ˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘˘
   Hint: Une inversion numérique ne peut se trouver qu'à
         la racine d'une rêgle.
  
  E027 cycle de dépendance détecté [cycle warning]
       ╒══  nak/not_root/rules.publicodes:1:4 ══
     1 │ a: b + 10
       │    ˘˘ la règle se référence elle-même
  

Nak not used :
  $ publicodes compile nak/not_used -o - | ../../../scripts/get_functions.awk
  
  E041
  la rêgle fournie pour résoudre l'inversion numérique ne dépends pas en retour de la rêgle
  [syntax error]
       ╒══  nak/not_used/rules.publicodes:6:9 ══
     5 │     avec:
     6 │       - a
       │         ˘
  
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
