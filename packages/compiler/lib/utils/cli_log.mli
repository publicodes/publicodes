val info : Pp_tty.t list -> unit
(** [log_info pps] logs an informational message with the given pretty-printed text [pps].
		The message is prefixed with "Info." in a styled format. *)

val error : Pp_tty.t list -> unit
(** [log_error pps] logs an error message with the given pretty-printed text [pps].
		The message is prefixed with "Erreur." in a styled format. *)

val ok : Pp_tty.t list -> unit
(** [log_ok pps] logs a success message with the given pretty-printed text [pps].
		The message is prefixed with "Succès." in a styled format. *)
