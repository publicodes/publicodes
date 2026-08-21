(** This module allows to performs both the type inference and the type checking
    at the same time.

    It uses the {!UnionFind} module to perform unification of types. This means
    that the [typing_tree] is updated in place and enriched with the inferred
    types. *)

val type_check :
     replaces:Replacement_graph.Rule_graph.t
  -> Ast.typing_tree
  -> Base.unit Utils.Output.t
(** [type_check ~replaces typing_tree] infers types of the internal
    [typing_tree] and returns possible type errors as the [typing_tree] is
    updated in place. *)
