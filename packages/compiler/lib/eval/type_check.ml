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
let concrete_to_str = function
  | Concrete_type.Number ->
      "un nombre"
  | Concrete_type.String ->
      "un texte"
  | Concrete_type.Bool ->
      "un booléen (oui / non)"
  | Concrete_type.Date ->
      "une date"

let unify_concrete ~(database : Type_database.t) ({id; pos; _} : 'a meta)
    (concrete_type : Concrete_type.t) =
  let id = resolve_symlink_and_compress ~database id in
  match database.(id) with
  | Concrete concrete_id ->
      if [%compare.equal: Concrete_type.t] concrete_type concrete_id |> not then
        let code, message = Err.type_invalid_type in
        (* TODO: add position of the different arguments *)
        return
          ~logs:
            [ Log.error ~pos ~kind:`Type ~code
                ~labels:
                  [ Pos.mk ~pos
                      (Format.sprintf "%s était attendu (%s a été trouvé)"
                         (concrete_to_str concrete_type)
                         (concrete_to_str concrete_id) ) ]
                message ]
          ()
      else return ()
  | Null ->
      database.(id) <- Concrete concrete_type ;
      return ()
  | Link _ ->
      return ()

let unify ~(database : Type_database.t) node_a node_b =
  let node_a =
    {node_a with id= resolve_symlink_and_compress ~database node_a.id}
  in
  let node_b =
    {node_b with id= resolve_symlink_and_compress ~database node_b.id}
  in
  match (database.(node_a.id), database.(node_b.id)) with
  | Null, Null ->
      database.(node_a.id) <- Link node_b.id ;
      return ()
  | Null, Concrete c ->
      database.(node_a.id) <- Concrete c ;
      return ()
  | Concrete c, Null ->
      database.(node_b.id) <- Concrete c ;
      return ()
  | Concrete concrete_a, Concrete concrete_b ->
      if [%compare.equal: Concrete_type.t] concrete_a concrete_b |> not then
        (* Todo replace with a unique type_error, with the pos of the different arguments *)
        let code, message = Err.type_incoherence in
        return
          ~logs:
            [ Log.error ~pos:node_a.pos ~kind:`Type ~code
                ~labels:
                  [ Pos.mk ~pos:node_a.pos
                      (Format.sprintf "est %s" (concrete_to_str concrete_a))
                  ; Pos.mk ~pos:node_b.pos
                      (Format.sprintf "est %s" (concrete_to_str concrete_b)) ]
                message ]
          ()
      else return ()
  | _, _ ->
      return ()
(* failwith "Unexpected link after resolving symlinks" *)

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
      | Undefined | Null ->
          return () )
    | Binary_op ((operator, _), left, right) -> (
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
    | Unary_op ((Neg, _), value) ->
        let* _ = unify_computation value in
        let* _ = unify_concrete ~database meta Number in
        unify_concrete ~database (snd value) Number
    | Unary_op ((Is_undef, _), value) ->
        let* _ = unify_computation value in
        unify_concrete ~database meta Bool
    | Condition (cond, value1, value2) ->
        let* _ = unify_computation cond in
        let* _ = unify_computation value1 in
        let* _ = unify_computation value2 in
        let* _ = unify_concrete (snd cond) ~database Bool in
        let* _ = unify ~database (snd value1) (snd value2) in
        unify ~database meta (snd value1)
    | Ref name ->
        (* return () *)
        let _, ref_meta = Hashtbl.find_exn tree name in
        unify ~database meta ref_meta
    | Get_context _ ->
        return ()
        (* let _, ref_meta = Hashtbl.find_exn tree name in
        unify ~database meta ref_meta *)
    | Set_context {context; value} ->
        let* _ = unify_computation value in
        let* _ = unify ~database meta (snd value) in
        let* _ =
          List.map context ~f:(fun (rule_name, value) ->
              let* _ = unify_computation value in
              let _, rule_meta = Hashtbl.find_exn tree (Pos.value rule_name) in
              unify ~database (snd value) rule_meta )
          |> all_keep_logs
        in
        return ()
  in
  let* _ =
    Hashtbl.to_alist tree
    |> List.map ~f:(fun (_, rule) -> unify_computation rule)
    |> Output.all_keep_logs
  in
  return database
