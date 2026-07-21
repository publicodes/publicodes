open Shared
open Utils

val transform :
     replacement_graph:Replacement_graph.Rule_graph.t
  -> make_not_applicable_graph:Replacement_graph.Rule_graph.t
  -> Rule_name.t
  -> Typ.t Tree.value
  -> Typ.t Tree.value Output.t
