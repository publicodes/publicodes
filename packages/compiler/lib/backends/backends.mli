open Shared

(** This modules allows to generates string representations from an {!Eval_tree} *)

val to_js :
     ?without_trace:bool
  -> Typ.t option Eval_tree.t
  -> Shared.Model_output.t list
  -> string
(** [to_js tree outputs ~without_trace] converts an eval tree to its corresponding
    JavaScript code.

    If the [without_trace] argument is set to [true], the generated code will
    not include the evaluation trace information (i.e. the [$ret('<id>')]
    calls). *)

val to_debug : Typ.t option Eval_tree.t -> Shared.Model_output.t list -> string
(** [to_debug tree outputs] converts an eval tree to its corresponding
    debug string representation. *)
