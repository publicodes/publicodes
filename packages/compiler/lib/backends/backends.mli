open Shared

(** This modules allows to generates string representations from an {!Eval_tree} *)

val to_js : Typ.t option Eval_tree.t -> Shared.Model_output.t list -> string
(** [to_js tree outputs] converts an eval tree to its corresponding
    JavaScript code. *)

val to_debug : Typ.t option Eval_tree.t -> Shared.Model_output.t list -> string
(** [to_debug tree outputs] converts an eval tree to its corresponding
    debug string representation. *)
