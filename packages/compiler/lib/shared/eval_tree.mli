open Utils

type constant =
  | Number of float * Units.t option
  | Bool of bool
  | String of string
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
  | Binary_op of binary_op Pos.t * 'meta value * 'meta value
  | Unary_op of unary_op Pos.t * 'meta value
  | Ref of Rule_name.t
  | Get_context of Rule_name.t
  | Set_context of 'meta context
  | Round of (Shared_ast.rounding * 'meta value * 'meta value)
[@@deriving show]

and 'meta context =
  {context: (Rule_name.t Pos.t * 'meta value) list; value: 'meta value}
[@@deriving show]

and 'meta value = {value: 'meta naked_value; meta: 'meta; pos: Pos.pos}
[@@deriving show]

type 'meta mk_value_fn = pos:Pos.pos -> 'meta naked_value -> 'meta value

type 'meta t = 'meta value Rule_name.Hashtbl.t [@@deriving show]

val get_meta : 'meta t -> Rule_name.t -> 'meta
(** FIXME: should be _exn *)

val get_pos : 'meta t -> Rule_name.t -> Pos.pos

val map_value : f:('meta value -> 'meta value) -> 'meta value -> 'meta value

(** {1 Constructors for naked values} *)

val unop_is_not_defined : pos:Pos.pos -> 'meta value -> 'meta naked_value

val binop_or : pos:Pos.pos -> 'meta value -> 'meta value -> 'meta naked_value

val binop_eq : pos:Pos.pos -> 'meta value -> 'meta value -> 'meta naked_value

val mk_condition :
     cond:'meta value
  -> then_:'meta value
  -> else_:'meta value
  -> 'meta naked_value

val const_not_applicable : 'meta naked_value

val const_not_defined : 'meta naked_value

val const_false : 'meta naked_value
