open Shared
module Rule_graph = Rule_graph
module Rule_context = Rule_context

type t = Rule_graph.t

val mk_and_checks :
     Shared_ast.resolved
  -> replacement_graph:Replacement_graph.t
  -> make_not_applicable_graph:Replacement_graph.t
  -> t Utils.Output.t
(** [mk_and_checks ast ~replacement_graph ~make_not_applicable_graph] constructs a
    dependency graph from the resolved AST and performs checks on it. It returns
    the constructed dependency graph if all checks pass, or an error if any
    check fails. *)
