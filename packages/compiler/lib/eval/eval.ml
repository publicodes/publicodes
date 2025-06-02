open Utils.Output
module Tree = Eval_tree
module Parameters = Eval_tree.Parameters

let from_resolved_ast = From_ast.from_ast

let type_check tree =
  return tree >>= Type_check.type_check >>| Simplify_unit.simplify

let to_json = To_json.with_parameters
