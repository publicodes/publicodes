open Base
open Utils
open Shared

module Any : Utils.Uid.S

type naked_t = Literal of Typ.literal | Number of Number_unit.t | Any of Any.t

and t = naked_t Pos.t UnionFind.elem

(** Constructors *)

val mk : pos:Pos.pos -> naked_t -> t

val any : pos:Pos.pos -> unit -> t

val literal : pos:Pos.pos -> Typ.literal -> t

val number_with_unit : pos:Pos.pos -> Units.t -> t

val any_number : pos:Pos.pos -> unit -> t

(** Operations *)

val unify : t -> t -> t Output.t

val multiply : pos:Pos.pos -> t -> t -> t

val divide : pos:Pos.pos -> t -> t -> t

val get_unit : t -> Units.t Output.t

(** Translators *)

val to_concrete : t -> Shared.Typ.t option

val to_string : t -> string
