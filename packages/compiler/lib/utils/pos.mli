(** Source code positions. *)

module Point : sig
  (** [index] is the byte index in the file. [line] and [column] are the line and
		column numbers in the file. The first line and column are 1.

		@note The [index] is in 0-based index. The [line] and [column] are in
		1-based index. *)
  type t = {index: int; line: int; column: int} [@@deriving equal]

  val pp : Format.formatter -> t -> unit

  val of_position : Lexing.position -> t

  val to_position : t -> file:File.t -> Lexing.position

  val dummy : t
  (** A dummy position used when no position information is available. *)
end

type t = {file: File.t; start_pos: Point.t; end_pos: Point.t}
[@@deriving equal, compare, show, sexp]

val beginning_of_file : File.t -> t
(** [beginning_of_file file] returns a position at the beginning of the file. *)

val dummy : t
(** A dummy position used when no position information is available. *)

val add : ?len:int -> ?line:int -> t -> t

val merge : t -> t -> t
(** [merge pos1 pos2] merges two positions into a single position.
    If the positions are from different files, an exception is raised. *)

val to_loc : t -> Stdune.Loc.t
(** Convert a position to a Stdune location. *)
