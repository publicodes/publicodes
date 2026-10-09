type t = Fpath.t

val of_string : string -> (t, [`Msg of string]) result
(** [of_string path] converts the [path] as string to t as a result. *)

val of_string_exn : string -> t
(** [of_string_exn path] converts [path] as string to t. Raise an exception
  when path is invalid. *)

val to_system : t -> string
(** [to_system path] converts [path] as t to string, for Publicodes rendering. *)

val to_intern : t -> string
(** [to_intern path] converts [path] as t to string, for system usage. *)

val pp_system : Format.formatter -> t -> unit

val pp_intern : Format.formatter -> t -> unit

val pp : Format.formatter -> t -> unit

val read_file : t -> string
(** [read_file path] reads the content of the file at [path]. *)

val write_file : path:t -> content:string -> unit
(** [write_file ~path ~content] writes the [content] to the file at [path]. *)

val equal : t -> t -> bool
(** [equal one two] checks if the two paths are equal. *)

val compare : t -> t -> int
(** [equal one two] compares the two paths. *)

val t_of_sexp : Sexplib0.Sexp.t -> Fpath.t

val sexp_of_t : Fpath.t -> Sexplib0.Sexp.t

val std : t
(** Represent a standard input/output. *)

val is_valid_import_str : string -> bool
(** [is_valid_import_str ~path] checks that a value is a valid Publicode
  module or package *)

val is_valid_import : t -> bool
(** [is_valid_import ~path] checks that a value is a valid Publicode module or
  package *)

val relativize : t -> t -> t option
(** [relativize ~dir ~path] in case of relative path, concats the two
  path to build a relative directory path. Returns None if the path is
  not a relative (prefix "./") *)

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
