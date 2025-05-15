open Utils
open Core
open Utils.Output
open Concrete_type
open Shared.Shared_ast
open Eval_tree.Raw
open Type_database

(*

This module implements the type checking algorithm described by Richard Feldman in « Building a Static
Type-Inferring Compiler » online course

Cf : https://docs.google.com/presentation/d/1EkOFQCGFAIuIKG7sJB2ibsWE3Q8eti9UShLgo_z0rwo/

*)

let type_error ~pos (expected : Concrete_type.t) (actual : Concrete_type.t) =
  let concrete_to_str = function
    | Concrete_type.Number ->
        "un nombre"
    | Concrete_type.String ->
        "un texte"
    | Concrete_type.Bool ->
        "un booléen (oui / non)"
    | Concrete_type.Date ->
        "une date"
  in
  let message =
    Format.sprintf "Le type attendu était %s, mais %s a été trouvé à la place"
      (concrete_to_str expected) (concrete_to_str actual)
  in
  return ~logs:[Log.error ~pos ~kind:`Type message] ()

let unify_concrete ~(database : Type_database.t) ({id; pos; _} : 'a meta)
    (concrete_type : Concrete_type.t) =
  let id = resolve_symlink_and_compress ~database id in
  match database.(id) with
  | Concrete concrete_id ->
      if [%compare.equal: Concrete_type.t] concrete_type concrete_id |> not then
        type_error ~pos concrete_type concrete_id
      else return ()
  | Link _ ->
      failwith "Unexpected link after resolving symlinks"
  | Null ->
      database.(id) <- Concrete concrete_type ;
      return ()

let rec unify ~(database : Type_database.t) node_a node_b =
  let node_a =
    {node_a with id= resolve_symlink_and_compress ~database node_a.id}
  in
  let node_b =
    {node_b with id= resolve_symlink_and_compress ~database node_b.id}
  in
  match (database.(node_a.id), database.(node_b.id)) with
  | Null, value_b ->
      database.(node_a.id) <-
        ( match value_b with
        | Null ->
            Link node_b.id
        | Concrete c ->
            Concrete c
        | Link _ ->
            failwith "Unexpected link after resolving symlinks" ) ;
      return ()
  | _, Null ->
      unify ~database node_b node_a (* Swap args *)
  | Concrete concrete_a, Concrete concrete_b ->
      if [%compare.equal: Concrete_type.t] concrete_a concrete_b |> not then
        (* Todo replace with a unique type_error, with the pos of the different arguments *)
        let* _ = type_error ~pos:node_b.pos concrete_a concrete_b in
        type_error ~pos:node_a.pos concrete_b concrete_a
      else return ()
  | Link _, _ | _, Link _ ->
      failwith "Unexpected link after resolving symlinks"

let type_check (tree : unit Eval_tree.Raw.t) =
  let database = Type_database.mk () in
  let rec unify_computation (computation, meta) =
    match computation with
    | Const const -> (
      match const with
      (* TODO : sort topological order ? *)
      | Number _ ->
          unify_concrete ~database meta Number
      | Bool _ ->
          unify_concrete ~database meta Bool
      | String _ ->
          unify_concrete ~database meta String
      | Date _ ->
          unify_concrete ~database meta Date
      | _ ->
          return () )
    | BinaryOp ((operator, _), left, right) -> (
        let* _ = unify_computation left in
        let* _ = unify_computation right in
        match operator with
        | And | Or ->
            let* _ = unify_concrete ~database meta Bool in
            let* _ = unify_concrete ~database (snd left) Bool in
            unify_concrete ~database (snd right) Bool
        | Add | Sub | Mul | Div | Pow ->
            let* _ = unify_concrete ~database meta Number in
            let* _ = unify_concrete ~database (snd left) Number in
            unify_concrete ~database (snd right) Number
        | Gt | Lt | LtEq | GtEq | Eq | NotEq ->
            let* _ = unify_concrete ~database meta Bool in
            unify ~database (snd left) (snd right) )
    | UnaryOp ((Neg, _), value) ->
        let* _ = unify_concrete ~database meta Number in
        unify_concrete ~database (snd value) Number
    | Condition (cond, value1, value2) ->
        let* _ = unify_computation cond in
        let* _ = unify_computation value1 in
        let* _ = unify_computation value2 in
        let* _ = unify_concrete meta ~database Bool in
        unify ~database (snd value1) (snd value2)
    | Ref name ->
        let _, ref_meta = Hashtbl.find_exn tree name in
        unify ~database meta ref_meta
  in
  let* _ =
    Hashtbl.to_alist tree
    |> List.map ~f:(fun (_, rule) -> unify_computation rule)
    |> Output.from_list
  in
  (* Format.printf "Type Database:\n %a \n\n" Type_database.pp database ;
  Format.printf "AST :\n=====\n\n" ;
  Format.printf "%a" Eval_tree
  .pp ast ; *)
  return database
