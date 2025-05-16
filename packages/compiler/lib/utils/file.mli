type t = string [@@deriving show]

val read_file : t -> string
(** [read_file path] reads the content of the file at [path]. *)

val write_file : path:t -> content:string -> unit
(** [write_file ~path ~content] writes the [content] to the file at [path]. *)
