(** A simple YAML parser and printer.

    This module provides a simple interface to parse and print YAML data. *)

open Utils

(** Abstraction over [Yaml.yaml] with positions information. *)
type t =
  | Scalar of Yaml.scalar With_pos.t
  | Alias of string With_pos.t
  | A of sequence
  | O of mapping
  | Nothing of unit With_pos.t
  | EOF

and sequence = {
  s_anchor : string option;
  s_tag : string option;
  s_implicit : bool;
  s_members : t list;
}

and mapping = {
  m_anchor : string option;
  m_tag : string option;
  m_implicit : bool;
  m_members : (t * t) list;
}

val parse : string -> (t, [ `Msg of string ]) result
(** [parse str] parses a YAML string into a [t] value or error message.

    @param str The YAML string to parse.
    @return A result containing either the parsed [t] value or an error message.
*)

(* val print : t -> unit *)
(** [print yaml] prints the [t] value to the standard output. *)
