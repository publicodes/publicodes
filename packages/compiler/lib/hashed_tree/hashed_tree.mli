(** Final representation of a Publicodes program before code generation.

    This is a hashed version of the typed tree, where each node is associated
    with the hash of it subtree.

    @note This was used to generate a flat AST to be interpreted, but at the
    moment it's not longer used for the JS code generation. It may be useful in
    the future for optimizations, but if not, it should be removed.
 *)

type t = Tree.t

val from_typed_tree : Typed_tree.t -> t
(** [from_typed_tree typed_tree] returns a hashed tree generated from
    [typed_tree]. *)

val to_js_str : t -> Shared.Model_outputs.t -> string
(** [to_js_str tree outputs] converts a hashed typed tree to its corresponding
    JavaScript code. *)

val to_debug_str : t -> Shared.Model_outputs.t -> string
(** [to_debug tree outputs] converts a hashed typed tree to its corresponding
    debug string representation. *)
