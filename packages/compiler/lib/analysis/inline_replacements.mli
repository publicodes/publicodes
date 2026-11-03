open Shared

val inline :
     replacement_graph:Replacement_graph.t
  -> make_not_applicable_graph:Replacement_graph.t
  -> Shared_ast.typed
  -> Shared_ast.inlined
(** [inline ~replacement_graph ~make_not_applicable_graph ast] fills each
    reference with the rules that replace it at its site. Must run after
    [Analysis.mk_and_checks]: the resolution walks the replacement edges, which
    are only known to be acyclic once the union cycle check has passed. *)
