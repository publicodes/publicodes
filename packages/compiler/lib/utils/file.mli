type t = Fpath.t

val pp : Format.formatter -> t -> unit

val of_string : string -> (t, [`Msg of string]) result

val of_string_exn : string -> t

val to_system : t -> string
(** [to_system path] render a path as a system path. *)

val to_intern : t -> string
(** [to_intern path] render a path in a standardized way. *)

val read_file : t -> string
(** [read_file path] reads the content of the file at [path]. *)

val write_file : content:string -> t -> unit
(** [write_file ~content path] writes the [content] to the file. *)

val equal : t -> t -> bool
(** [equal one two] compare the two paths. *)

val compare : t -> t -> int
(** [equal one two] compare the two paths. *)

val t_of_sexp : Sexplib0.Sexp.t -> Fpath.t

val sexp_of_t : Fpath.t -> Sexplib0.Sexp.t

val std : t

val is_valid_import_str : string -> bool
(** [is_valid_import_str ~path] checks that a value is a valid Publicode
  module or package *)

val is_valid_import : t -> bool
(** [is_valid_import ~path] checks that a value is a valid Publicode module or
  package *)

val relativize : t -> t -> t
(** [relativize ~dir ~path] in case of relative path, concat the two
  valid import path to build a relative module directory path.
  Returns the path unchanged if arguments are invalid paths *)

type gather_module_error =
  | Invalid_path of string
  | Not_found of t
  | Is_not_directory of t
  | Empty_directory of t

val gather_module : ?package:t -> string -> (t list, gather_module_error) result
(** [publicodes_module ~package ~module] list Publicodes files in a package
  module. *)

type find_package_error =
  | Invalid_path of string
  | Not_found of t list
  | Absent_env
  | Empty_env
  | Invalid_env of string list

val find_package : t option -> string -> (t, find_package_error) result
(** [publicodes_package ~current_package ~path] finds the path to the package
  directory. *)

val dirname : t -> t
(* [dirname ~path] Returns the directory path of a file or directory path. *)
