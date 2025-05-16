val exit_err : int

val exit_parsing_err : int

(** Basic error code to exit with if an error occurs. *)

open Cmdliner

(** {1 Common arguments} *)

val files : string list Term.t
(** [files] arguments to the command line. It is a list of file names. *)
