open Shared

include module type of Tree

val from_typed_ast :
     replacement_graph:Replacement_graph.Rule_graph.t
  -> make_not_applicable_graph:Replacement_graph.Rule_graph.t
  -> Shared_ast.typed
  -> Typ.t option Tree.t
