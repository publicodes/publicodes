(** A module that generates unique integers, starting from 0. *)

module Make () : sig
  type t [@@deriving sexp, show, compare]

  val mk : unit -> t
  (** [mk ()] returns a new unique integer and increments the counter. *)
end
