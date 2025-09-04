include Utils.Output
module Typ = Typ
include Tree

let from_resolved_ast = From_ast.from_ast

let mk = Tree.mk ?typ:None

let type_check tree =
  (*
	1. Typecheck pass (twice)
	-------------------------

	We need to traverse the tree twice for good unit inference and error detecting

	- The first time, we create unit type for each number and unify what can be unify.
	- The second time, everything that can be infered has been infered, so we can check for type inconsistency

	@TODO : the simplest and more efficient way to do it would be have topological sort before type checking
*)
  let* tree =
    tree |> Type_check.type_check |> ignore_logs
    >>= Type_check.type_check ~snd_pass:true
  in
  (*
  2. Post-typecheck pass
  ----------------------

  Normalization and implementations that depend on the type inferred.
  These transformations must occur after type checking.

	Note: Ideally, we would use a different AST representation, but this
	would complicate the codebase. If it appears that the ASTs are too
	different, consider refactoring this to a new pass.
*)
  let post_transform value =
    value |> Simplify_unit.simplify_value |> Mecha_rounding.normalize_value
  in
  let normalized_tree =
    Core.Hashtbl.map ~f:(Shared.Eval_tree.map ~f:post_transform) tree
  in
  return normalized_tree
