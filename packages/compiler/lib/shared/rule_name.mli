open Base

(** Publicodes rule names utilities. *)

(** We use a internal [T] module encapsulate the rule name representation to
		easily create {!Set} and {!Hashtbl} modules with the same type.

		We keep the utility functions at the top-level of the {!Rule_name} module. *)

(** {2 Rule name type and related modules} *)

(** Module encapsulating the rule name type and related functions base
		functions. It's only purpose it to be used to create the {!Set} and
		{!Hashtbl} modules, therefore it should not be used directly in the rest of
		the codebase. *)
module T : sig
  type t [@@deriving equal, compare, show, sexp]

  val hash : t -> int

  include Comparable.S with type t := t
end

type t = T.t

type comparator_witness = T.comparator_witness

include
  module type of T
    with type t := t
     and type comparator_witness := comparator_witness

(** Set implementation with {!T.t} elements. *)
module Set : module type of Set.M (T)

(** Hashtable implementation with {!T.t} keys. *)
module Hashtbl : sig
  include module type of Hashtbl.M (T)

  val pp :
       (Stdlib.Format.formatter -> 'a -> unit)
    -> Stdlib.Format.formatter
    -> 'a t
    -> unit
end

(** {2 Rule name utilities} *)

val create_exn : string list -> t
(** [create_exn dotted_name] creates a rule name from a list of strings
		representing the segments of the name.

		@raise Invalid_argument if the list is empty. *)

val parent : t -> t option
(** [parent rule_name] returns the immediate parent of a dotted name, or {!None}
			if the name is empty or has only one segment.

			{[
				parent ["a"; "b"; "c"] = Some ["a"; "b"]
				parent ["a"] = None
				parent [] = None
			]} *)

val parents : t -> t list
(** [parents rule_name] returns all the parents of a dotted name, from the immediate
		parent to the top-level parent.

		{[
			parents ["a"; "b"; "c"] = [["a"; "b"]; ["a"]]
			parents ["a"] = []
			parents [] = []
		]} *)

val to_string : t -> string
(** [to_string rule_name] converts a rule name to its string representation, where
		the segments are joined by [" . "].

		{[
			to_string ["a"; "b"; "c"] = "a . b . c"
			to_string ["a"] = "a"
			to_string [] = ""
		]} *)

val resolve : rule_names:Set.t -> current:t -> string list -> t option
(** [resolve ~rule_names ~current name] resolves a fully qualified rule name
		from a potentially relative [name] in the context of [current] and a set of
		valid [rule_names].

		Note: we need to be sure of the heuristic used to find the rule name if
		there is multiple matches.

		{[
			let rule_names = Set.of_list (module Rule_name) [["a"; "b"; "c"]; ["a"; "d"]]
			resolve ~rule_names ~current:["a"; "b"] ["c"] = Some ["a"; "b"; "c"]
			resolve ~rule_names ~current:["a"; "b"] ["d"] = Some ["a"; "d"]
			resolve ~rule_names ~current:["a"; "b"] ["e"] = None
		]} *)

val make_reserved : string -> t
(** [make_reserved name] creates a reserved rule name from [name].

		Reserved rule names are only used for internal representation and cannot be
		matching any user-defined rule name. *)
