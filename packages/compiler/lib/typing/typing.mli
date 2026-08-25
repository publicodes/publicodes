open Shared

val type_check :
     replacement_graph:Replacement_graph.t
  -> Shared_ast.resolved
  -> Shared_ast.typed Utils.Output.t
(** [type_check resolved] type-checks the resolved AST by returning a typed AST
    with inferred and annotated types. *)
