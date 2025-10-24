open Utils

type constant =
  | Number of float * Units.t option
  | Bool of bool
  | String of string
  | Date of Shared_ast.date
  | Undefined
  | Null
[@@deriving show]

type binary_op = Shared_ast.binary_op [@@deriving show]

type unary_op = Neg | Is_undef [@@deriving show]

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
