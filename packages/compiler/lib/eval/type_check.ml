open Ast
open Common
open Type_database
open Core

(*

This module implements the type checking algorithm described by Richard Feldman in « Building a Static
Type-Inferring Compiler » online course

Cf : https://docs.google.com/presentation/d/1EkOFQCGFAIuIKG7sJB2ibsWE3Q8eti9UShLgo_z0rwo/

*)
let rec resolve_symlink_and_compress ~(database : Type_database.t)
    (type_id : Type_database.id) : Type_database.id =
  match database.(type_id) with
  | Link linked_id ->
      let resolved_id = resolve_symlink_and_compress ~database linked_id in
      database.(type_id) <- Link resolved_id ;
      resolved_id
  | _ ->
      type_id

let unify_concrete ~(database : Type_database.t) (id : Type_database.id)
    (concrete_type : Type_database.concrete_type) =
  let id = resolve_symlink_and_compress ~database id in
  match database.(id) with
  | Concrete concrete_id ->
      if [%compare.equal: concrete_type] concrete_type concrete_id |> not then
        failwith
          ( "Type mismatch: "
          ^ show_concrete_type concrete_type
          ^ " != "
          ^ show_concrete_type concrete_id )
  | Link _ ->
      failwith "Unexpected link after resolving symlinks"
  | Null ->
      database.(id) <- Concrete concrete_type

let rec unify ~(database : Type_database.t) (id_a : Type_database.id)
    (id_b : Type_database.id) : unit =
  let resolved_a_id = resolve_symlink_and_compress ~database id_a in
  let resolved_b_id = resolve_symlink_and_compress ~database id_b in
  match (database.(resolved_a_id), database.(resolved_b_id)) with
  | Null, value_b ->
      database.(resolved_a_id) <-
        ( match value_b with
        | Null ->
            Link resolved_b_id
        | Concrete c ->
            Concrete c
        | Link _ ->
            failwith "Unexpected link after resolving symlinks" )
  | _, Null ->
      unify ~database resolved_b_id resolved_a_id (* Swap args *)
  | Concrete concrete_a, Concrete concrete_b ->
      if [%compare.equal: concrete_type] concrete_a concrete_b |> not then
        failwith
          ( "Type mismatch: "
          ^ show_concrete_type concrete_a
          ^ " != "
          ^ show_concrete_type concrete_b )
  | Link _, _ | _, Link _ ->
      failwith "Unexpected link after resolving symlinks"

let type_check (ast : Ast.t) =
  let database = Type_database.mk () in
  let get_id (computation : Ast.computation) =
    match computation with
    | Ast.Typed (_, id) ->
        id
    | Ast.Ref name ->
        snd (Hashtbl.find_exn ast name)
  in
  let rec type_check_computation (computation : Ast.computation) =
    match computation with
    | Ast.Typed (typed_computation, id) ->
        unify_computation id typed_computation
    | _ ->
        ()
  and unify_computation (id : Type_database.id)
      (computation : Ast.typed_computation) : unit =
    match computation with
    | Ast.Const const -> (
      match const with
      | Number _ ->
          unify_concrete ~database id Number
      | Bool _ ->
          unify_concrete ~database id Bool
      | String _ ->
          unify_concrete ~database id String
      | Date _ ->
          unify_concrete ~database id Date
      | _ ->
          () )
    | Ast.BinaryOp (operator, left, right) -> (
        type_check_computation left ;
        type_check_computation right ;
        match operator with
        | Shared_ast.Add
        | Shared_ast.Sub
        | Shared_ast.Mul
        | Shared_ast.Div
        | Shared_ast.Pow ->
            unify_concrete ~database id Number ;
            unify_concrete ~database (get_id left) Number ;
            unify_concrete ~database (get_id right) Number
        | Shared_ast.Gt
        | Shared_ast.Lt
        | Shared_ast.LtEq
        | Shared_ast.GtEq
        | Shared_ast.Eq
        | Shared_ast.NotEq ->
            unify_concrete ~database id Bool ;
            unify ~database (get_id left) (get_id right) )
    | Ast.UnaryOp (Shared_ast.Neg, value) ->
        unify_concrete ~database id Number ;
        unify_concrete ~database (get_id value) Number
    | Ast.Condition (cond, value1, value2) ->
        type_check_computation cond ;
        type_check_computation value1 ;
        type_check_computation value2 ;
        unify_concrete ~database id Bool ;
        unify ~database (get_id value1) (get_id value2)
  in
  let type_check_rule (computation, id) =
    let linked_id = get_id computation in
    unify ~database id linked_id ;
    type_check_computation computation
  in
  Hashtbl.iter ast ~f:type_check_rule ;
  Format.printf "Type Database:\n %a \n\n" Type_database.pp database ;
  Format.printf "AST :\n=====\n\n" ;
  Format.printf "%a" Ast.pp ast ;
  ast
