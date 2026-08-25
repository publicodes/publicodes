open Shared
open Utils

type constant =
  | Number of float * Units.t option
  | Bool of bool
  | String of string
  | Symbol of string
  | Date of Shared_ast.date
  | Not_defined
  | Not_applicable
[@@deriving show]

type binary_op = Shared_ast.binary_op [@@deriving show]

(** We need to have a specific unary operator to check if a value is not defined
    to avoid propagating the [Not_defined] value (which would happen if we used
    the binop [Eq]). *)
type unary_op = Neg | Is_not_defined [@@deriving show]

type 'meta naked_value =
  | Const of constant
  | Condition of 'meta value * 'meta value * 'meta value
  | Binary_op of binary_op Mark.pos * 'meta value * 'meta value
  | Unary_op of unary_op Mark.pos * 'meta value
  | Ref of Rule_name.t
  | Get_context of Rule_name.t
  | Set_context of 'meta context
  | Round of (Shared_ast.rounding * 'meta value * 'meta value)
  | Exclusive_replacement of (Rule_name.t * Rule_name.t list)
[@@deriving show]

and 'meta context =
  {context: (Rule_name.t Mark.pos * 'meta value) list; value: 'meta value}
[@@deriving show]

and 'meta value = {value: 'meta naked_value; meta: 'meta; pos: Pos.t}
[@@deriving show]

type 'meta mk_value_fn = pos:Pos.t -> 'meta naked_value -> 'meta value

type 'meta t = 'meta value Rule_name.Hashtbl.t [@@deriving show]

val get_value : 'meta t -> Rule_name.t -> 'meta value

val mk_value : pos:Pos.t -> meta:'meta -> 'meta naked_value -> 'meta value

val get_meta_exn : 'meta t -> Rule_name.t -> 'meta

val get_pos_exn : 'meta t -> Rule_name.t -> Pos.t

val map_value : f:('meta value -> 'meta value) -> 'meta value -> 'meta value

(** {1 Constructors for naked values} *)

val unop_is_not_defined : pos:Pos.t -> 'meta value -> 'meta naked_value

val binop_or : pos:Pos.t -> 'meta value -> 'meta value -> 'meta naked_value

val binop_and : pos:Pos.t -> 'meta value -> 'meta value -> 'meta naked_value

val binop_eq : pos:Pos.t -> 'meta value -> 'meta value -> 'meta naked_value

val binop_neq : pos:Pos.t -> 'meta value -> 'meta value -> 'meta naked_value

val binop_lt : pos:Pos.t -> 'meta value -> 'meta value -> 'meta naked_value

val binop_gt : pos:Pos.t -> 'meta value -> 'meta value -> 'meta naked_value

val binop_add : pos:Pos.t -> 'meta value -> 'meta value -> 'meta naked_value

val binop_mul : pos:Pos.t -> 'meta value -> 'meta value -> 'meta naked_value

val binop_max : pos:Pos.t -> 'meta value -> 'meta value -> 'meta naked_value

val binop_min : pos:Pos.t -> 'meta value -> 'meta value -> 'meta naked_value

val binop_pow : pos:Pos.t -> 'meta value -> 'meta value -> 'meta naked_value

val mk_condition :
     cond:'meta value
  -> then_:'meta value
  -> else_:'meta value
  -> 'meta naked_value

val mk_exclusive_replacement :
  target:Rule_name.t -> replacements:Rule_name.t list -> 'meta naked_value

val const_not_applicable : 'meta naked_value

val const_not_defined : 'meta naked_value

val const_false : 'meta naked_value

val const_true : 'meta naked_value

val get_contexts : 'a value -> Rule_name.t Utils.Mark.pos Base.list
