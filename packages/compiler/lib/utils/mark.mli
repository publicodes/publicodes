(** AST node annotations (position, type, etc.).

    This is inspired by Catala's compiler
    {{:https://github.com/CatalaLang/catala/blob/master/compiler/catala_utils/mark.mli}
    Mark module} module. The mark on a node carries source position information.
    For position-only marks, use ['a pos]. For marks with additional metadata
    (e.g. type information), use a record containing a [pos] field (e.g. [{pos: Pos.t; typ: Typ.t}]).

    @note If more robust polymorphic position extraction is needed in the
    future, consider switching to a GADT approach (see Catala's
    [catala_utils/mark.ml] for the full design). *)

(** Position-only mark. *)
type pos_mark = {pos: Pos.t} [@@deriving equal, compare, show, sexp]

(** [('a, 'm) ed] is a value of type ['a] annotated with a mark of type ['m]. *)
type ('a, 'm) ed = 'a * 'm [@@deriving equal, compare, show, sexp]

(** ['a pos] is a value annotated with only a source position. *)
type 'a pos = ('a, pos_mark) ed [@@deriving equal, compare, show, sexp]

val add : 'm -> 'a -> ('a, 'm) ed
(** [add mark node] annotates [node] with [mark]. *)

val remove : ('a, 'm) ed -> 'a
(** [remove e] returns the wrapped value without the mark. *)

val get : ('a, 'm) ed -> 'm
(** [get e] returns the mark. *)

val pos : 'a pos -> Pos.t
(** [pos e] returns the source position of a position-only marked value. *)

val map : f:('a -> 'b) -> ('a, 'm) ed -> ('b, 'm) ed
(** [map f e] applies [f] to the wrapped value while preserving the mark. *)

val copy : ('b, 'm) ed -> 'a -> ('a, 'm) ed
(** [copy src node] copies the mark from [src] onto [node]. *)

val set : 'm -> ('a, _) ed -> ('a, 'm) ed
(** [set mark e] replaces the mark on [e] with [mark]. *)

val mk_pos : pos:Pos.t -> 'a -> 'a pos
(** [mk_pos ~pos node] constructs a position-only annotated value. *)
