open Core
open Utils

type constant =
  | Number of float * Units.t option
  | Bool of bool
  | String of string
  | Date of Shared_ast.date
  | Undefined
  | Null
[@@deriving sexp, show]

type binary_op = Shared_ast.binary_op [@@deriving sexp, show]

type unary_op = Neg | Is_undef [@@deriving sexp, show]

type 'meta naked_value =
  | Const of constant
  | Condition of 'meta value * 'meta value * 'meta value
  | Binary_op of binary_op Pos.t * 'meta value * 'meta value
  | Unary_op of unary_op Pos.t * 'meta value
  | Ref of Rule_name.t
  | Get_context of Rule_name.t
  | Set_context of 'meta context
  | Round of (Shared_ast.rounding * 'meta value * 'meta value)
[@@deriving show, sexp]

and 'meta context =
  {context: (Rule_name.t Pos.t * 'meta value) list; value: 'meta value}
[@@deriving sexp, show]

and 'meta value = {value: 'meta naked_value; meta: 'meta; pos: Pos.pos}
[@@deriving sexp, show]

type 'meta t = 'meta value Rule_name.Hashtbl.t [@@deriving sexp, show]

let get_meta eval_tree rule_name = (Hashtbl.find_exn eval_tree rule_name).meta

let get_pos eval_tree rule_name = (Hashtbl.find_exn eval_tree rule_name).pos

let rec map ~(f : 'a value -> 'b value) (c : 'a value) : 'b value =
  let new_value =
    match c.value with
    | Condition (cond, then_comp, else_comp) ->
        Condition (map ~f cond, map ~f then_comp, map ~f else_comp)
    | Binary_op (op, left, right) ->
        Binary_op (op, map ~f left, map ~f right)
    | Unary_op (op, comp) ->
        Unary_op (op, map ~f comp)
    | Set_context {context; value} ->
        let context =
          List.map context ~f:(fun (rule_name, comp) ->
              (rule_name, map ~f comp) )
        in
        let value = map ~f value in
        Set_context {context; value}
    | v ->
        v
  in
  f {c with value= new_value}
