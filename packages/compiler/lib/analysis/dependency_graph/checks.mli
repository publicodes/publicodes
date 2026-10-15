(** Dependency graph analysis. *)

val mk_and_checks :
     Shared.Shared_ast.resolved
  -> replacement_graph:Replacement_graph.Rule_graph.t
  -> make_not_applicable_graph:Replacement_graph.Rule_graph.t
  -> Rule_graph.t Utils.Output.t
