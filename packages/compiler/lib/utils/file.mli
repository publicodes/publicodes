type t = string [@@deriving show]

val read_file : t -> string
val write_file : path:t -> content:string -> unit
