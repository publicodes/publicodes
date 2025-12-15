(** Module to attach position information to values.

    NOTE: we may want to refactor this module to a more generic way of Mark. *)

module Point : sig
  (** [index] is the byte index in the file. [line] and [column] are the line and
		column numbers in the file. The first line and column are 1.

		@note The [index] is in 0-based index. The [line] and [column] are in
		1-based index. *)
  type t = {index: int; line: int; column: int} [@@deriving equal]

  val pp : Format.formatter -> t -> unit

  val of_position : Lexing.position -> t

  val to_position : t -> file:string -> Lexing.position

  val dummy : t
  (** A dummy position used when no position information is available. *)
end

(** Represents a range in a file. *)
type pos = {file: string; start_pos: Point.t; end_pos: Point.t}
[@@deriving equal, compare, show, sexp]

(** Type to attach position information to a value. The first element is the
    value and the second element is the position. *)
type 'a t = 'a * pos [@@deriving equal, compare, show, sexp]

(** {2 Map operation} *)

val map : f:('a -> 'b) -> 'a t -> 'b t
(** [map ~f m] applies the function [f] to the value of [m] and keeps the
    position information. *)

val ( >>| ) : 'a t -> ('a -> 'b) -> 'b t
(** Infix operator of the {!map} function. *)

val ( let+ ) : 'a t -> ('a -> 'b) -> 'b t
(** [let+ x f] is a syntactic sugar for [map ~f x]. It allows to use the
    applicative style. *)

(** {2 Utility functions} *)

val value : 'a t -> 'a
(** [value val] returns the value without the position information. *)

val pos : 'a t -> pos
(** [pos val] returns the position information of the value. *)

val mk : pos:pos -> 'a -> 'a t
(** [mk ~pos x] creates a new value with the given position [pos] and value [x]. *)

val beginning_of_file : string -> pos
(** [beginning_of_file file] returns a position at the beginning of the file. *)

val dummy : pos
(** A dummy position used when no position information is available. *)

val is_empty_file : pos -> bool
(** [is_empty_file pos] returns true if the file is empty. *)

val add : ?len:int -> ?line:int -> pos -> pos
(** [add ?len ?line pos] adds [len] to the column number and [line] to the end position of [pos]. *)

val merge : pos -> pos -> pos
(** [merge pos1 pos2] merges two positions [pos1] and [pos2] into a single position.
    If the positions are from different files, an exception is raised. *)

val to_loc : pos -> Stdune.Loc.t
(** Convert a position to a Stdune location. *)
