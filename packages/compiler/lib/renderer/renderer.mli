open Shared

val to_js_str : Typ.t option Eval_tree.t -> Model_output.t list -> string
(** [to_js_str tree outputs] converts an eval typed tree to its corresponding
    JavaScript code. *)

val to_debug_str : Typ.t option Eval_tree.t -> Model_output.t list -> string
(** [to_debug tree outputs] converts an eval typed tree to its corresponding
    debug string representation. *)
