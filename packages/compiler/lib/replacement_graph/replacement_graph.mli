(** Dependency graph analysis. *)

val mk_and_checks :
  Shared.Shared_ast.resolved -> (Rule_graph.t * Rule_graph.t) Utils.Output.t

val find_replacements :
     from:Rule_graph.vertex
  -> rule:Rule_graph.vertex
  -> Rule_graph.t
  -> (Shared.Rule_name.t * Rule_graph.replace_meta Utils.Mark.pos) list

module Rule_graph = Rule_graph
