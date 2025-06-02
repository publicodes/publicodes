include Utils.Output
module Typ = Typ
include Tree

let from_resolved_ast = From_ast.from_ast

let type_check tree =
  return tree >>= Type_check.type_check >>| Simplify_unit.simplify
