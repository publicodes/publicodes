(** This module defines the internal AST used for the typing pass.

    The {!precision} of a type is separated from its {!kind} to simplify the
    implementation of the type checker. *)

open Base

module Any : Utils__Uid.S

(** {2 Types} *)

(** {3 Literals} *)

type literal =
  | LNumber of float * Number_unit.t
  | LBool of bool
  | LString of string
  | LSymbol of string
  | LDate of Shared.Typ.date

val equal_literal : literal -> literal -> bool

val compare_literal : literal -> literal -> int

val sort_enum :
  ('a * Utils.Mark.pos_mark) List.t -> ('a * Utils.Mark.pos_mark) List.t

val get_missing_literals :
  (literal * 'a) List.t -> (literal * 'a) List.t -> (literal * 'a) List.t
(** [get_missing_literals enum1 enum2] returns the list of literals that are in
    [enum1] but not in [enum2]. *)

val is_enum_subset : (literal * 'a) List.t -> (literal * 'a) List.t -> bool
(** [is_enum_subset enum1 enum2] returns true if all the literals in [enum1] are
    also in [enum2]. *)

val literal_to_string : literal -> string

val literal_to_string_short : literal -> string

(** {3 Kinds and precision} *)

type kind = KNumber of Number_unit.t | KString | KBool | KDate | KSymbol

type precision =
  | Any_kind of Any.t
  | General
  | Literal of literal Utils.Mark.pos
  | Enum of literal Utils.Mark.pos list

type t = Any of Any.t | Typed of kind * precision

val to_string : ?sep:String.t -> t -> string

type typ = t Utils.Mark.pos UnionFind.elem

type typing_mark = {pos: Utils.Pos.t; typ: typ}

type typing_value = (Shared.Rule_name.t, typing_mark) Shared.Shared_ast.value

type typing_rule_def =
  (Shared.Rule_name.t, typing_mark) Shared.Shared_ast.rule_def

type typing_value_mechanism =
  (Shared.Rule_name.t, typing_mark) Shared.Shared_ast.value_mechanism

type typing_marked_value_mechanism =
  (typing_value_mechanism, typing_mark) Utils.Mark.ed

type typing_expr = (Shared.Rule_name.t, typing_mark) Shared.Shared_ast.expr

type typing = (Shared.Rule_name.t, typing_mark) Shared.Shared_ast.t

type typing_chainable_mechanism =
  (Shared.Rule_name.t, typing_mark) Shared.Shared_ast.chainable_mechanism

type typing_marked_chainable_mechanism =
  (typing_chainable_mechanism, typing_mark) Utils.Mark.ed

type typing_state = Todo | Doing | Done | Error

type typing_tree = (typing_rule_def * typing_state) Shared.Rule_name.Hashtbl.t

(** {2 Typing tree functions} *)

val typ_to_string : ?sep:string -> typ -> string

val set_typing_state :
     (Shared.Rule_name.t, typing_rule_def * typing_state) Hashtbl.t
  -> typing_rule_def
  -> typing_state
  -> unit

val is_todo : typing_state -> bool

val get_sorted_rule_defs : typing_tree -> typing_rule_def list
(** [get_sorted_rule_defs typing_tree] returns the list of rule definition of
    the [typing_tree] sorted by their position in the source code. *)

val from_mark : Utils.Mark.pos_mark -> typ -> typing_mark

val get_sorted_chainable_mechanisms :
     typing_marked_chainable_mechanism list
  -> typing_marked_chainable_mechanism list
(** [get_sorted_chainable_mechanisms chainable_mechanisms] returns the
    [chainable_mechanisms] sorted by the precedence (defined in
    {!Shared.Shared_ast.chainable_mechanism}) *)

val get_first_element_pos_exn : typing_value list -> Utils.Pos.t
(** [get_first_element_pos_exn value] returns the position of the first element
    of [value]. Raises an exception if [value] is empty. *)

(** {2 Constructors} *)

val mk : pos:Utils.Pos.t -> t -> typ

val mk_any : pos:Utils.Pos.t -> typ

val mk_typed : pos:Utils.Pos.t -> kind -> precision -> typ

val mk_any_kind : pos:Utils.Pos.t -> kind -> typ

val mk_any_number : pos:Utils.Pos.t -> typ

val mk_any_bool : pos:Utils.Pos.t -> typ

val mk_any_string : pos:Utils.Pos.t -> typ

val mk_any_date : pos:Utils.Pos.t -> typ

val kind_of_literal : literal -> kind

val mk_literal : pos:Utils.Pos.t -> literal -> typ

val mk_lit_number : pos:Utils.Pos.t -> float -> Shared.Units.t option -> typ

val mk_lit_bool : bool -> pos:Utils.Pos.t -> typ

val mk_lit_string : string -> pos:Utils.Pos.t -> typ

val mk_lit_symbol : string -> pos:Utils.Pos.t -> typ

val mk_lit_day : int -> int -> int -> pos:Utils.Pos.t -> typ

val mk_lit_month : int -> int -> pos:Utils.Pos.t -> typ

val mk_general : pos:Utils.Pos.t -> kind -> typ

val mk_string : pos:Utils.Pos.t -> typ

val mk_bool : pos:Utils.Pos.t -> typ

val mk_date : pos:Utils.Pos.t -> typ

val mk_number : unit:Shared.Units.t option -> pos:Utils.Pos.t -> typ
(** [mk_number ~unit ~pos] creates a type representing a number with an optional
    unit. If [unit] is [None], it represents a number with an [Any] unit. *)

val mk_number_without_unit : pos:Utils.Pos.t -> typ
(** [mk_number_without_unit ~pos] creates a type representing a number without a
    unit.

    @note This is not the same as [mk_number ~unit:None ~pos], which represents
    a number with an [Any] unit. Here the unit is explicitly set to an empty
    unit. *)

val mk_enum_precision : literal Utils.Mark.pos List.t -> precision

val mk_enum : pos:Utils.Pos.t -> literal Utils.Mark.pos List.t -> typ

val literal_of_shared_typ :
  Shared.Typ.literal Utils.Mark.pos -> literal * Utils.Mark.pos_mark

val literal_to_shared_typ :
  literal Utils.Mark.pos -> Shared.Typ.literal * Utils.Mark.pos_mark

val mk_typ : pos:Utils.Pos.t -> Shared.Typ.t -> typ

val literal_to_general : typ -> t

(** {2 Type comparison functions} *)

val is_kind_equal : kind -> kind -> bool

val is_bool : t -> bool

val is_typ_number_with_unit : typ -> bool
(** [is_typ_number_with_unit typ] returns true if [typ] is a number with unit
    (i.e. not any or empty unit). *)

(** {2 Constants} *)

val number_without_unit : t
(** [number_without_unit] is a type representing a number without a unit. *)
