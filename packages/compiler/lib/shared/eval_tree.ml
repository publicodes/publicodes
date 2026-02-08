open Base
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

let get_meta eval_tree rule_name = (Hashtbl.find_exn eval_tree rule_name).meta

let get_pos eval_tree rule_name = (Hashtbl.find_exn eval_tree rule_name).pos

let rec map_value ~(f : 'a value -> 'a value) (c : 'a value) : 'a value =
  let new_value =
    match c.value with
    | Condition (cond, then_comp, else_comp) ->
        Condition
          (map_value ~f cond, map_value ~f then_comp, map_value ~f else_comp)
    | Binary_op (op, left, right) ->
        Binary_op (op, map_value ~f left, map_value ~f right)
    | Unary_op (op, comp) ->
        Unary_op (op, map_value ~f comp)
    | Set_context {context; value} ->
        let context =
          List.map context ~f:(fun (rule_name, comp) ->
              (rule_name, map_value ~f comp) )
        in
        let value = map_value ~f value in
        Set_context {context; value}
    | Round (rounding, precision, value) ->
        Round (rounding, map_value ~f precision, map_value ~f value)
    | Ref _ | Const _ | Get_context _ ->
        c.value
  in
  f {c with value= new_value}
