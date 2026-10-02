open Base
open Utils

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

val is_root : T.t -> bool
(** [is_root module] returns true if module is the root module *)

val append : T.t -> int Mark.pos -> T.t
(** [append module id] push a module id to the module_id *)

val empty : T.t
(** [empty] returns the empty module_id *)

val to_list : T.t -> int Mark.pos list
(** [to_list module] return the module id as list *)
