open Utils

val compile_file : string -> filename:string -> string option * Log.t list
(** [compile_file content ~filename] compiles the given [content] string
		and returns the result of the compilation. The [filename] is used for
		error reporting. The function returns a tuple of an option containing the
		compiled content and a list of logs. *)
