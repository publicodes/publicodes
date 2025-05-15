open Core
open Utils
open Utils.Output

type date =
  | Day of {day: int; year: int; month: int}
  | Month of {month: int; year: int}
[@@deriving sexp, compare, show]

type constant =
  | Number of float * Units.t option
  | Bool of bool
  | String of string
  | Date of date
[@@deriving sexp, compare, show]

type binary_op =
  | Add
  | Sub
  | Mul
  | Div
  | Pow
  | Gt
  | Lt
  | GtEq
  | LtEq
  | Eq
  | NotEq
  | And
  | Or
[@@deriving sexp, compare, show]

type unary_op = Neg [@@deriving sexp, compare, show]

type 'a naked_expr =
  | Const of constant
  | Ref of 'a
  | Binary_op of binary_op Pos.t * 'a expr * 'a expr
  | Unary_op of unary_op Pos.t * 'a expr
[@@deriving show, sexp, compare]

and 'a expr = 'a naked_expr Pos.t [@@deriving show, sexp, compare]

type 'a naked_value =
  | Expr of 'a expr
  | Undefined
  | Sum of 'a value list
  | Product of 'a value list
  | All_of of 'a value list
  | One_of of 'a value list
  | Applicable_if of 'a value * 'a value
  | Not_applicable_if of 'a value * 'a value
  | Ceiling of 'a value * 'a value
  | Floor of 'a value * 'a value
(* | Variations of
      (* If-then list *)
      ( 'a variation list
      * (* followed by an optional `else` case *)
      'a value option )
      Pos.t *)
[@@deriving show, sexp, compare]

and 'a value = 'a naked_value Pos.t [@@deriving show, sexp, compare]

(* and 'a variation = {if_: 'a value; then_: 'a value} *)

type rule_meta = Title of string | Description of string | Public
[@@deriving show, sexp, compare]

type 'a rule_def =
  {name: Rule_name.t Pos.t; value: 'a value; meta: rule_meta list}
[@@deriving show, sexp, compare]

type 'a program = 'a rule_def list [@@deriving show, sexp, compare]

type 'a t = 'a program [@@deriving show, sexp, compare]

type resolved = Rule_name.t t [@@deriving show, sexp, compare]

let has_public_tag rule_def =
  List.exists ~f:(function Public -> true | _ -> false) rule_def.meta

let has_value rule_def =
  match rule_def.value with Undefined, _ -> false | _ -> true
(** Map expression *)
let rec map_expr :
    type a b.
    ?default_node:(b naked_expr) ->
    ?f:(pos:Pos.pos -> b naked_expr -> b naked_expr Output.t) ->
    f_ref:(pos:Pos.pos -> a -> b Output.t) ->
    a expr ->
    b expr Output.t =
 fun ?default_node ?f ~f_ref (expr, pos) ->

  let map_expr = map_expr ?default_node ?f ~f_ref in
  let id_return ~pos:_ x = return ~logs:[] x in
  let f = Option.value ~default:id_return f in
  let output_expr = (
    match expr with
    | Binary_op (op, left, right) ->
        let* mapped_left = map_expr left in
        let+ mapped_right = map_expr right in
        Binary_op (op, mapped_left, mapped_right)
    | Unary_op (op, operand) ->
        let+ mapped_operand = map_expr operand in
        Unary_op (op, mapped_operand)
    | Const c -> return (Const c)
    | Ref r ->
        let+ ref_value = f_ref ~pos r in
        Ref ref_value ) >>= f ~pos
  in
  let+ expr =
    match default_node with
    | Some default -> output_expr |> default_to ~default
    | None -> output_expr
  in
  (expr, pos)

(** Map value *)
let rec map_value :
    type a b.
    ?default_node:(b naked_value) ->
    ?f:(pos:Pos.pos -> b naked_value -> b naked_value Output.t) ->
    f_expr:(a expr -> b expr Output.t) ->
    a value ->
    b value Output.t =
 fun ?default_node ?f ~f_expr ((value, pos) : a value) ->
  let map_value = map_value ?default_node ?f ~f_expr in
  let id_return ~pos:_ x = return ~logs:[] x in
  let f = Option.value ~default:id_return f in
  let value_output = (
    match value with
    | Expr expr ->
        let+ mapped_expr = f_expr expr in
        Expr mapped_expr
    | Sum values ->
        let+ mapped_values = List.map values ~f:map_value |> all_keep_logs in
        Sum mapped_values
    | Product values ->
        let+ mapped_values = List.map values ~f:map_value |> all_keep_logs in
        Product mapped_values
    | All_of values ->
        let+ mapped_values = List.map values ~f:map_value |> all_keep_logs in
        All_of mapped_values
    | One_of values ->
        let+ mapped_values = List.map values ~f:map_value |> all_keep_logs in
        One_of mapped_values
    | Applicable_if (value, node) ->
        let* value = map_value value in
        let+ node = map_value node in
        Applicable_if (value, node)
    | Not_applicable_if (value, node) ->
        let* value = map_value value in
        let+ node = map_value node in
        Not_applicable_if (value, node)
    | Ceiling (value, node) ->
        let* value = map_value value in
        let+ node = map_value node in
        Ceiling (value, node)
    | Floor (value, node) ->
        let* value = map_value value in
        let+ node = map_value node in
        Floor (value, node)
    | Undefined ->
        return Undefined)
  >>=  f ~pos in
  let+ value =
    match default_node with
    | Some default ->
        value_output |> default_to ~default
    | None -> value_output
  in
  (value, pos)
