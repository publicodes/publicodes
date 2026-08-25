open Shared

val transform :
     replacement_graph:Replacement_graph.Rule_graph.t
  -> make_not_applicable_graph:Replacement_graph.Rule_graph.t
  -> Rule_name.t
  -> Typ.t option Tree.value
  -> Typ.t option Tree.value
