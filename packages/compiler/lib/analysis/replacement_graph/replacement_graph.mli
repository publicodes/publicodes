(** Dependency graph analysis. *)

open Shared

type t = Rule_graph.t

type replacement = Rule_graph.replacement

val mk_and_checks : Shared_ast.resolved -> (t * t) Utils.Output.t

val find_replacements :
     from:Rule_name.t
  -> rule:Rule_name.t
  -> t
  -> (Rule_name.t * replacement Utils.Mark.pos) list

val find_transitive_replacements :
     from:Rule_name.t
  -> rule:Rule_name.t
  -> t
  -> (Rule_name.t * replacement Utils.Mark.pos) list

module Rule_graph = Rule_graph
