include Utils.Output
module Typ = Typ
include Tree

let from_resolved_ast ast =
  let tree = From_ast.from_ast ast in
  tree

let type_check tree =
  let* tree = tree |> Type_check.type_check in
  print tree ;
  return (Simplify_unit.simplify tree)
