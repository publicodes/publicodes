include module type of Tree

val from_typed_ast :
     replacement_graph:Replacement_graph.Rule_graph.t
  -> make_not_applicable_graph:Replacement_graph.Rule_graph.t
  -> Shared.Shared_ast.typed
  -> Shared.Typ.t Tree.t Utils.Output.t
