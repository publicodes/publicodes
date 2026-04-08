(** This modules generate Jingo models based on the hashed tree, in a lambda calculus way. *)

val to_js : Tree.t -> Shared.Model_outputs.t -> string
(** [to_js tree outputs] converts a hashed typed tree to its corresponding
    JavaScript code. *)

val to_debug : Tree.t -> Shared.Model_outputs.t -> string
(** [to_debug tree outputs] converts a hashed typed tree to its corresponding
    debug string representation. *)
