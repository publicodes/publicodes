open Shared

val type_check : Shared_ast.resolved -> Shared_ast.typed Utils.Output.t
(** [type_check resolved] type-checks the resolved AST by returning a typed AST
    with inferred and annotated types. *)
