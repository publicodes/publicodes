val to_typed : Ast.typing_tree -> Shared.Shared_ast.typed Utils.Output.t
(** [to_typed ast] converts the internal typing [ast] to a typed AST with
    inferred and annotated types. *)
