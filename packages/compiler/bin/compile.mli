open Cmdliner

val compile_target : Compiler.t -> string -> Cmd.Exit.code
(** [compile_target target output_path] compiles the given [target] and writes
    the result to [output_path]. It returns a command exit code indicating
    success or failure. *)
