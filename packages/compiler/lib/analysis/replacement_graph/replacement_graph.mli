(** Dependency graph analysis. *)

open Shared

type t = Rule_graph.t

type replace = Rule_graph.replacement

val mk_and_checks : Shared_ast.resolved -> (t * t) Utils.Output.t

val find_transitive_replacements :
     from:Rule_name.t
  -> rule:Rule_name.t
  -> t
  -> (Rule_name.t * replace Utils.Mark.pos) list

val resolve :
     from:Rule_name.t
  -> replacement_graph:t
  -> make_not_applicable_graph:t
  -> rule:Rule_name.t
  -> Shared_ast.inlined_ref

module Rule_graph = Rule_graph
