open Shared
open Utils

val transform :
     replacement_graph:Replacement_graph.Rule_graph.t
  -> make_not_applicable_graph:Replacement_graph.Rule_graph.t
  -> Rule_name.t
  -> Type.t Tree.value
  -> Type.t Tree.value Output.t
