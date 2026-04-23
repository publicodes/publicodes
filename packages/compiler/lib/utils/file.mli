type t = string

val pp : Format.formatter -> t -> unit

val read_file : t -> string
(** [read_file path] reads the content of the file at [path]. *)

val write_file : path:t -> content:string -> unit
(** [write_file ~path ~content] writes the [content] to the file at [path]. *)

val is_valid_import : string -> bool
(** [is_valid_import ~path] checks that a value is a valid Publicode module or
  package *)

val relativize : string -> string -> string
(** [relativize ~dir ~path] in case of relative path, concat the two
  valid import path strings to build a relative module directory path.
  Returns the path unchanged if arguments are invalid paths *)

type gather_module_error =
  | Invalid_path of string
  | Not_found of string
  | Is_not_directory of string
  | Empty_directory of string

val gather_module :
  ?package:string -> string -> (string list, gather_module_error) result
(** [publicodes_module ~package ~module] list Publicodes files in a package
  module. *)

type find_package_error =
  | Invalid_path of string
  | Not_found of string list
  | Absent_env
  | Empty_env
  | Invalid_env of string list

val find_package :
  string option -> string -> (string, find_package_error) result
(** [publicodes_package ~current_package ~path] finds the path to the package
  directory. *)
