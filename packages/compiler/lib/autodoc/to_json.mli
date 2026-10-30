open Shared

val to_str :
     replacement_graph:Replacement_graph.t
  -> make_not_applicable_graph:Replacement_graph.t
  -> Shared_ast.typed
  -> Base.string
