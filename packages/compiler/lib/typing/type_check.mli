(** This module allows to performs both the type inference and the type checking
    at the same time.

    It uses the {!UnionFind} module to perform unification of types. This means
    that the [typing_tree] is updated in place and enriched with the inferred
    types. *)

val type_check : Ast.typing_tree -> Replacement_graph.t -> unit Utils.Output.t
(** [type_check typing_tree replacement_graph] infers types of the internal
    [typing_tree] and returns possible type errors as the [typing_tree] is
    updated in place. *)
