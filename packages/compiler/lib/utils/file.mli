type t = string

val pp : Format.formatter -> t -> unit

val read_file : t -> string
(** [read_file path] reads the content of the file at [path]. *)

val write_file : path:t -> content:string -> unit
(** [write_file ~path ~content] writes the [content] to the file at [path]. *)

val is_valid : string -> bool
(** [is_valid ~path] returns true if the path is a valid Publicode path *)

val relativize : string -> string -> string
(** [relativize ~dir ~path] in case of relative path, concat the two
  valid Publicode path strings to build a relative module directory path. *)

val publicodes_module : ?package:string -> string -> string Base.List.t option
(** [publicodes_module ~package ~module] list Publicodes files in a package
module. *)

val publicodes_package : string -> string option
(** [publicodes_package ~path] gives the path to the package directory. *)
