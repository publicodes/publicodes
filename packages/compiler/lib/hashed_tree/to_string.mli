(** This modules allows to generates string representations from a hashed tree.
 *)

val to_js : Tree.t -> Shared.Model_output.t list -> string
(** [to_js tree outputs] converts a hashed typed tree to its corresponding
    JavaScript code. *)

val to_debug : Tree.t -> Shared.Model_output.t list -> string
(** [to_debug tree outputs] converts a hashed typed tree to its corresponding
    debug string representation. *)
