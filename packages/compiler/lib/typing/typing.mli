open Shared

val type_check : Shared_ast.inlined -> Shared_ast.typed Utils.Output.t
(** [type_check inlined] type-checks the AST whose references are inlined, by
    returning a typed AST with inferred and annotated types. *)
