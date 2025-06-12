include Utils.Output
module Typ = Typ
include Tree

let from_resolved_ast ast =
  let tree = From_ast.from_ast ast in
  tree

let type_check tree =
  (* We need to traverse the tree twice for good unit inference and error detecting *)
  (* The first time, we create unit type for each number and unify what can be unify. *)
  let* tree = tree |> Type_check.type_check |> ignore_logs in
  (* The second time, everything that can be infered has been infered, so we can check for type inconsistency *)
  let* tree = tree |> Type_check.type_check in
  (* TODO : the simplest and more efficient way to do it would be have topological sort before type checking *)
  return (Simplify_unit.simplify tree)
