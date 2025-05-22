open Core
open Shared
open Utils

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

type unary_op = Neg | Is_undef [@@deriving sexp, show]

(* GADT-based implementation *)

type computation =
  | Const of constant
  | Condition of typ_computation * typ_computation * typ_computation
  | Binary_op of binary_op Pos.t * typ_computation * typ_computation
  | Unary_op of unary_op Pos.t * typ_computation
  | Ref of Rule_name.t
  | Get_context of Rule_name.t
  | Set_context of context

and context =
  {context: (Rule_name.t Pos.t * typ_computation) list; value: typ_computation}

and typ_computation = {pos: Pos.pos; typ: Types.t; value: computation}

type t = typ_computation Rule_name.Hashtbl.t

let mk ~pos value =
  let typ = Types.any ~pos () in
  {pos; typ; value}

module Parameters = struct
  type t = (Shared.Rule_name.t * Shared.Rule_name.t list) list
end

let get_type eval_tree rule_name =
  (Hashtbl.find_exn eval_tree rule_name).typ |> UnionFind.get |> Pos.value

let get_pos eval_tree rule_name = (Hashtbl.find_exn eval_tree rule_name).pos
