(** Dependency graph analysis. *)

open Shared

type replacement = Rule_graph.replacement

val mk_and_checks :
  Shared_ast.resolved -> (Rule_graph.t * Rule_graph.t) Utils.Output.t

val find_replacements :
     from:Rule_name.t
  -> rule:Rule_name.t
  -> Rule_graph.t
  -> (Rule_name.t * replacement Utils.Mark.pos) list

val find_transitive_replacements :
     from:Rule_graph.vertex
  -> rule:Rule_graph.vertex
  -> Rule_graph.t
  -> (Shared.Rule_name.t * replacement Utils.Mark.pos) list

module Rule_graph = Rule_graph
