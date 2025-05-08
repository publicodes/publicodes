open Ast
open Common
open Type_database
open Utils
open Core
open Utils.Output

exception Unification_failed of concrete_type * concrete_type

(*

This module implements the type checking algorithm described by Richard Feldman in « Building a Static
Type-Inferring Compiler » online course

Cf : https://docs.google.com/presentation/d/1EkOFQCGFAIuIKG7sJB2ibsWE3Q8eti9UShLgo_z0rwo/

*)

let type_error ~pos (expected : concrete_type) (actual : concrete_type) =
  let concrete_to_str = function
    | Number ->
        "un nombre"
    | String ->
        "un texte"
    | Bool ->
        "un booléen (oui / non)"
    | Date ->
        "une date"
  in
  let message =
    Format.sprintf "Le type attendu était %s, mais %s a été trouvé à la place"
      (concrete_to_str expected) (concrete_to_str actual)
  in
  return ~logs:[Log.error ~pos ~kind:`Type message] ()

let rec resolve_symlink_and_compress ~(database : Type_database.t)
    (type_id : Type_database.id) : Type_database.id =
  match database.(type_id) with
  | Link linked_id ->
      let resolved_id = resolve_symlink_and_compress ~database linked_id in
      database.(type_id) <- Link resolved_id ;
      resolved_id
  | _ ->
      type_id

let unify_concrete ~(database : Type_database.t)
    ((id, pos) : Type_database.id Pos.t)
    (concrete_type : Type_database.concrete_type) =
  let id = resolve_symlink_and_compress ~database id in
  match database.(id) with
  | Concrete concrete_id ->
      if [%compare.equal: concrete_type] concrete_type concrete_id |> not then
        type_error ~pos concrete_type concrete_id
      else return ()
  | Link _ ->
      failwith "Unexpected link after resolving symlinks"
  | Null ->
      database.(id) <- Concrete concrete_type ;
      return ()

let rec unify ~(database : Type_database.t) (id_a, pos_a) (id_b, pos_b) =
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
            failwith "Unexpected link after resolving symlinks" ) ;
      return ()
  | _, Null ->
      unify ~database (resolved_b_id, pos_b) (resolved_a_id, pos_a)
      (* Swap args *)
  | Concrete concrete_a, Concrete concrete_b ->
      if [%compare.equal: concrete_type] concrete_a concrete_b |> not then
        (* Todo replace with a unique type_error, with the pos of the different arguments *)
        let* _ = type_error ~pos:pos_b concrete_a concrete_b in
        type_error ~pos:pos_b concrete_b concrete_a
      else return ()
  | Link _, _ | _, Link _ ->
      failwith "Unexpected link after resolving symlinks"

let type_check (ast : Ast.t) =
  let database = Type_database.mk () in
  let get_id_with_pos (computation : Ast.computation) =
    match computation with
    | Ast.Typed ((_, pos), id) ->
        Pos.mk pos id
    | Ast.Ref (name, pos) ->
        let (_, id), _ = Hashtbl.find_exn ast name in
        Pos.mk pos id
  in
  let rec type_check_computation (computation : Ast.computation) =
    match computation with
    | Ast.Typed (typed_computation, id) ->
        unify_computation id typed_computation
    | _ ->
        return ()
  and unify_computation (id : Type_database.id) (computation, pos) =
    let id = Pos.mk pos id in
    match computation with
    | Ast.Const const -> (
      match const with
      (* TODO : sort topological order ? *)
      | Number _ ->
          unify_concrete ~database id Number
      | Bool _ ->
          unify_concrete ~database id Bool
      | String _ ->
          unify_concrete ~database id String
      | Date _ ->
          unify_concrete ~database id Date
      | _ ->
          return () )
    | Ast.BinaryOp ((operator, _), left, right) -> (
        let* _ = type_check_computation left in
        let* _ = type_check_computation right in
        match operator with
        | Shared_ast.Add
        | Shared_ast.Sub
        | Shared_ast.Mul
        | Shared_ast.Div
        | Shared_ast.Pow ->
            let* _ = unify_concrete ~database id Number in
            let* _ = unify_concrete ~database (get_id_with_pos left) Number in
            unify_concrete ~database (get_id_with_pos right) Number
        | Shared_ast.Gt
        | Shared_ast.Lt
        | Shared_ast.LtEq
        | Shared_ast.GtEq
        | Shared_ast.Eq
        | Shared_ast.NotEq ->
            let* _ = unify_concrete ~database id Bool in
            unify ~database (get_id_with_pos left) (get_id_with_pos right) )
    | Ast.UnaryOp ((Shared_ast.Neg, _), value) ->
        let* _ = unify_concrete ~database id Number in
        unify_concrete ~database (get_id_with_pos value) Number
    | Ast.Condition (cond, value1, value2) ->
        let* _ = type_check_computation cond in
        let* _ = type_check_computation value1 in
        let* _ = type_check_computation value2 in
        let* _ = unify_concrete ~database id Bool in
        unify ~database (get_id_with_pos value1) (get_id_with_pos value2)
  in
  let type_check_rule ((computation, id), pos) =
    let id = Pos.mk pos id in
    let linked_id = get_id_with_pos computation in
    let* _ = unify ~database linked_id id in
    type_check_computation computation
  in
  let* _ =
    Hashtbl.to_alist ast
    |> List.map ~f:(fun (_, rule) -> type_check_rule rule)
    |> Output.from_list
  in
  Format.printf "Type Database:\n %a \n\n" Type_database.pp database ;
  Format.printf "AST :\n=====\n\n" ;
  Format.printf "%a" Ast.pp ast ;
  return ast
