(** Module to attach position information to values.

    NOTE: we may want to refactor this module to a more generic way of Mark. *)

type pos = { file : string; start_pos : int * int; end_pos : int * int }
[@@deriving show, sexp, compare]
(** Position type containing file name, line and column numbers. *)

type 'a t = 'a * pos [@@deriving show, sexp, compare]
(** Type to attach position information to a value. The first element is the
    value and the second element is the position. *)

val beginning_of_file : string -> pos
(** [beginning_of_file file] returns a position at the beginning of the file. *)

val dummy : pos
(** A dummy position used when no position information is available. *)

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

val without : 'a t -> 'a
(** [without pos] returns the value without the position information. *)

val mk : pos -> 'a -> 'a t
(** [mk pos x] creates a new value with the given position [pos] and value [x].
*)
