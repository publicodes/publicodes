open Core

(** The rule name type *)
type t

val pp : Format.formatter -> t -> unit
(** Pretty print a rule name with dot separators *)

val hash : t -> int
(** Hash function for rule names *)

val sexp_of_t : t -> Sexplib.Sexp.t
(** Convert a rule name to an S-expression *)

val t_of_sexp : Sexplib.Sexp.t -> t
(** Convert an S-expression to a rule name *)

val compare : t -> t -> int
(** Compare two rule names *)

(** Set implementation for rule names *)
module Set : sig
  include Set.S with type Elt.t = t
end

(** Hashtable implementation for rule names *)
module Hashtbl : sig
  include Hashtbl.S with type key = t
end

val create_exn : string list -> t
(** Create a rule name  *)

val parent : t -> t option
(** Get the immediate parent of a dotted name, if any.
    Returns None for empty lists or single-segment names. *)

val parents : t -> t list
(** Get all the parents of a dotted name, including the name itself *)

val to_string : t -> string
(** Convert a rule name to a string *)

val resolve : rule_names:Set.t -> current:t -> string list -> t option
(** Resolve a rule name relative to the current rule name *)
