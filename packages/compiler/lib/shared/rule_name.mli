open Core

(** The rule name type *)
type t [@@deriving eq, ord, show, sexp]

val hash : t -> int
(** Hash function for rule names *)

(** Set implementation for rule names *)
module Set : sig
  include Set.S with type Elt.t = t
end

(** Hashtable implementation for rule names *)
module Hashtbl : sig
  include Hashtbl.S with type key = t

  val pp : (Format.formatter -> 'a -> unit) -> Format.formatter -> 'a t -> unit
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
