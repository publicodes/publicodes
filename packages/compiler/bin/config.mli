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

val parse_yaml : in_channel -> (t, [`Msg of string]) result
(** [pare_yaml in_channel] parse a config from a yaml channel *)

val parse : string -> (t, [`Msg of string]) result
(** [pare config] parse a config from a file path. The parser is guessed
  from the file extension. *)
