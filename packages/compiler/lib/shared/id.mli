type t [@@deriving equal, compare]

val hash : Rule_name.t -> Utils.Pos.t -> t
(** [hash name pos] generates a unique identifier from a rule [name] and [pos]. *)

val equal : t -> t -> bool
(** [equal id1 id2] checks if two identifiers are equal. *)

val to_string : t -> string
(** [to_string id] converts the identifier to a string representation. *)
