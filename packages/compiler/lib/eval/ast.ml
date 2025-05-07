open Core
open Common

(* Extended version of constant with additional variants *)
type constant =
  | Number of float
  | Bool of bool
  | String of string
  | Date of Shared_ast.date
  | Undefined
  | Null
[@@deriving sexp, show]

(* We can reuse these types directly *)
type binary_op = Shared_ast.binary_op [@@deriving sexp, show]

type unary_op = Shared_ast.unary_op [@@deriving sexp, show]

type typed_computation =
  | Const of constant
  | Condition of computation * computation * computation
  | BinaryOp of binary_op * computation * computation
  | UnaryOp of unary_op * computation
[@@deriving sexp, show]

and computation =
  | Typed of (typed_computation * Type_database.id)
  | Ref of Rule_name.t
[@@deriving sexp, show]

let mk (c : typed_computation) : computation =
  let id = Type_database.next_id () in
  Typed (c, id)

type t = (computation * Type_database.id) Rule_name.Hashtbl.t [@@deriving sexp]

let pp fmt t =
  let open Format in
  Hashtbl.iteri t ~f:(fun ~key:rule_name ~data:(comp, _) ->
      let rule_str = Rule_name.to_string rule_name in
      (* Print rule name *)
      fprintf fmt "@[<v 0>%s@\n" rule_str ;
      (* Underline with dashes *)
      fprintf fmt "%s@\n" (String.make (String.length rule_str) '-') ;
      (* Print computation using auto-generated pp_computation *)
      pp_computation fmt comp ;
      fprintf fmt "@\n@\n@]" )
