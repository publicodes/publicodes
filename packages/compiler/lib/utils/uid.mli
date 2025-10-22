(** A module that generates unique integers, starting from 0. *)

module Make () : sig
  type t [@@deriving equal, show]

  val mk : unit -> t
  (** [mk ()] returns a new unique integer and increments the counter. *)

  val to_string : t -> string
  (** [to_string id] converts the unique integer [id] to its string representation. *)
end
