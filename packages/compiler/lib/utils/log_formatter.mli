(** Pretty printing module for compiler log messages. *)

val print : Log.t -> unit
(** [print log] prints a beautifully formatted error message for the given log.
    The output includes:
    - The error level and type with appropriate colors
    - A well-formatted location string, clickable in compatible IDEs
    - The error message
    - Source code excerpt with the problematic section underlined
    - Any hints provided with the error
*)
