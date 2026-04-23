open Base

module T : sig
  type t [@@deriving equal, compare, show, sexp]

  include Comparable.S with type t := t
end

type t = T.t

type comparator_witness = T.comparator_witness

include
  module type of T
    with type t := t
     and type comparator_witness := comparator_witness

val is_parent : T.t -> T.t -> bool
(** [is_parent module_a module_b] returns true if the module_b is a child of
module_a *)

val root : int list
(** [root] returns the root module_id *)

val is_root : T.t -> bool
(** [is_root module] returns true if module is the root module *)

val append : T.t -> int -> T.t
(** [append module id] push a module id to the module_id *)

val empty : T.t
(** [empty] returns the empty module_id *)
