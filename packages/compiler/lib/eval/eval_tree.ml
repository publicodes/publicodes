open Core
open Shared
open Utils

module Raw = struct
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

  (* GADT-based implementation *)
  type 'typ meta = {pos: Pos.pos; id: Node_id.t; typ: 'typ}
  [@@deriving sexp, show]

  type 'typ typed_computation =
    | Const of constant
    | Condition of 'typ computation * 'typ computation * 'typ computation
    | BinaryOp of binary_op Pos.t * 'typ computation * 'typ computation
    | UnaryOp of unary_op Pos.t * 'typ computation
    | Ref of Rule_name.t
  [@@deriving sexp, show]

  and 'typ computation = 'typ typed_computation * 'typ meta
  [@@deriving sexp, show]

  type 'typ t = 'typ computation Rule_name.Hashtbl.t [@@deriving sexp]

  let mk : type a. pos:Pos.pos -> typ:a -> a typed_computation -> a computation
      =
   fun ~pos ~typ c ->
    let id = Node_id.next () in
    (c, {pos; id; typ})

  (* Map over meta in a computation *)
  let rec map_meta : type a b.
      (a meta -> b meta) -> a computation -> b computation =
   fun f (typed_comp, meta) ->
    let new_meta = f meta in
    let new_typed_comp =
      match typed_comp with
      | Const c ->
          Const c
      | Condition (c1, c2, c3) ->
          Condition (map_meta f c1, map_meta f c2, map_meta f c3)
      | BinaryOp (op, c1, c2) ->
          BinaryOp (op, map_meta f c1, map_meta f c2)
      | UnaryOp (op, c) ->
          UnaryOp (op, map_meta f c)
      | Ref r ->
          Ref r
    in
    (new_typed_comp, new_meta)

  (* Map over meta in an entire evaluation tree *)
  let map_meta_tree : type a b. (a meta -> b meta) -> a t -> b t =
   fun f tree -> Hashtbl.map tree ~f:(map_meta f)

  (* let pp : type a. Format.formatter -> a t -> unit =
 fun fmt t ->
  let open Format in
  Hashtbl.iteri t ~f:(fun ~key:rule_name ~data:(comp, _meta) ->
      let rule_str = Rule_name.to_string rule_name in
      (* Print rule name *)
      fprintf fmt "@[<v 0>%s@\n" rule_str ;
      (* Underline with dashes *)
      fprintf fmt "%s@\n" (String.make (String.length rule_str) '-') ;
      (* Print computation using auto-generated pp_computation *)
      pp_computation fmt comp ;
      fprintf fmt "@\n@\n@]" ) *)
end

module Typed = struct
  (* Specialized type aliases where the type parameter is fixed to concrete_type option *)
  type typ = Concrete_type.t option

  type meta = typ Raw.meta

  type typed_computation = typ Raw.typed_computation

  type computation = typ Raw.computation

  type t = typ Raw.t

  let rule_meta (eval_tree : t) rule_name =
    snd @@ Hashtbl.find_exn eval_tree rule_name
end
