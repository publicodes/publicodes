open Shared

include module type of Tree

val from_typed_ast :
     make_not_applicable_graph:Replacement_graph.Rule_graph.t
  -> Shared_ast.inlined
  -> Typ.t option Tree.t
