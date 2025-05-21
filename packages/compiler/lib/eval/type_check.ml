open Utils
open Core
open Utils.Output
open Shared.Shared_ast
open Eval_tree
open Types

(*

This module implements the type checking algorithm described by Richard Feldman in « Building a Static
Type-Inferring Compiler » online course

Cf : https://docs.google.com/presentation/d/1EkOFQCGFAIuIKG7sJB2ibsWE3Q8eti9UShLgo_z0rwo/

*)
let type_check (tree : Eval_tree.t) =
  let rec unify_computation {typ; pos; value} =
    match value with
    | Const const -> (
      match const with
      (* TODO : sort topological order ? *)
      | Number _ ->
          let+ _ = unify typ (concrete ~pos Number) in
          ()
      | Bool _ ->
          let+ _ = unify typ (concrete ~pos Bool) in
          ()
      | String _ ->
          let+ _ = unify typ (concrete ~pos String) in
          ()
      | Date _ ->
          let+ _ = unify typ (concrete ~pos Date) in
          ()
      | Undefined | Null ->
          return () )
    | Binary_op ((operator, _), left, right) -> (
        let* _ = unify_computation left in
        let* _ = unify_computation right in
        match operator with
        | And | Or ->
            let* _ = unify typ (concrete ~pos Bool) in
            let* _ = unify left.typ (concrete ~pos Bool) in
            let+ _ = unify right.typ (concrete ~pos Bool) in
            ()
        | Add | Sub | Mul | Div | Pow ->
            let* _ = unify typ (concrete ~pos Number) in
            let* _ = unify left.typ (concrete ~pos Number) in
            let+ _ = unify right.typ (concrete ~pos Number) in
            ()
        | Gt | Lt | LtEq | GtEq | Eq | NotEq ->
            let* _ = unify typ (concrete ~pos Bool) in
            let+ _ = unify left.typ right.typ in
            () )
    | Unary_op ((op, _), expr) -> (
      match op with
      | Neg ->
          let* _ = unify_computation expr in
          let* _ = unify typ (concrete ~pos Number) in
          let+ _ = unify expr.typ (concrete ~pos Number) in
          ()
      | Is_undef ->
          let* _ = unify_computation expr in
          let+ _ = unify typ (concrete ~pos Bool) in
          () )
    | Condition (cond_expr, then_expr, else_expr) ->
        let* _ = unify_computation cond_expr in
        let* _ = unify_computation then_expr in
        let* _ = unify_computation else_expr in
        let* _ = unify cond_expr.typ (concrete ~pos Bool) in
        let* _ = unify then_expr.typ else_expr.typ in
        let+ _ = unify typ then_expr.typ in
        ()
    | Ref ref_name ->
        (* return () *)
        let rule = Hashtbl.find_exn tree ref_name in
        let+ _ = unify typ rule.typ in
        ()
    | Get_context _ ->
        return ()
        (* let _, ref_meta = Hashtbl.find_exn tree name in
          unify  meta ref_meta *)
    | Set_context {context= ctx; value= ctx_value} ->
        let* _ = unify_computation ctx_value in
        let* _ = unify typ ctx_value.typ in
        let* _ =
          List.map ctx ~f:(fun (rule_name, value) ->
              let* _ = unify_computation value in
              let rule = Hashtbl.find_exn tree (Pos.value rule_name) in
              let+ _ = unify value.typ rule.typ in
              () )
          |> all_keep_logs
        in
        return ()
  in
  let* _ =
    Hashtbl.to_alist tree
    |> List.map ~f:(fun (_, rule) -> unify_computation rule)
    |> Output.all_keep_logs
  in
  return tree
