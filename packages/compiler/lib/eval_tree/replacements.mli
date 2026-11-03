open Shared

val transform :
     make_not_applicable_graph:Replacement_graph.Rule_graph.t
  -> Shared.Shared_ast.typed
  -> Rule_name.t
  -> Typ.t option Tree.value
  -> Typ.t option Tree.value
