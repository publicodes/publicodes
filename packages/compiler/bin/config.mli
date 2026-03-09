(** This module provides methods to parse a configuration from different
  file formats. Currently only the Yaml format is supported.

  The Yaml format follows this structure:
  {@yaml[
  targets:
    - output: out.js
      inputs:
        - in.publicodes
      type: js
      default_to_public: false
  ]}
*)

(** Represent a build target *)
type t = {targets: Compile.t list}

(** {2 Parsing} *)

val parse_yaml : in_channel -> (t, [`Msg of string]) result
(** [parse_yaml ic] parse a config from a yaml channel *)

val parse : string -> (t, [`Msg of string]) result
(** [parse config_path] parse a config from a file path. The parser is guessed
  from the file extension. *)

(** {2 Defaults} *)

val get_default_yaml_str : unit -> string
(** [get_default_yaml_str ()] returns the default Yaml configuration, as a string,
  for this current cwd. *)
