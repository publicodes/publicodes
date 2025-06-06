open Utils
open Core
open Utils.Output
open Shared
open Shared.Shared_ast
open Eval_tree
open Typ

let type_check (tree : Eval_tree.t) =
  let rec unify_computation {typ; pos; value} =
    match value with
    | Const const -> (
      match const with
      (* TODO : sort topological order ? *)
      | Number (_, None) ->
          let+ _ = unify typ (any_number ~pos ()) in
          ()
      | Number (_, Some units) ->
          let+ _ = unify typ (number_with_unit ~pos units) in
          ()
      | Bool _ ->
          let+ _ = unify typ (literal ~pos Bool) in
          ()
      | String _ ->
          let+ _ = unify typ (literal ~pos String) in
          ()
      | Date _ ->
          let+ _ = unify typ (literal ~pos Date) in
          ()
      | Undefined | Null ->
          return () )
    | Binary_op ((operator, _), left, right) -> (
        let* _ = unify_computation left in
        let* _ = unify_computation right in
        match operator with
        | And | Or ->
            let* _ = unify typ (literal ~pos Bool) in
            let* _ = unify left.typ (literal ~pos Bool) in
            let+ _ = unify right.typ (literal ~pos Bool) in
            ()
        | Add | Sub ->
            let* _ = unify left.typ (any_number ~pos ()) in
            let* _ = unify right.typ (any_number ~pos ()) in
            let* _ = unify right.typ left.typ in
            let+ _ = unify typ left.typ in
            ()
        | Mul ->
            let* _ = unify left.typ (any_number ~pos ()) in
            let* _ = unify right.typ (any_number ~pos ()) in
            let+ _ = unify typ (multiply ~pos right.typ left.typ) in
            ()
        | Div ->
            let* _ = unify left.typ (any_number ~pos ()) in
            let* _ = unify right.typ (any_number ~pos ()) in
            let+ _ = unify typ (divide ~pos left.typ right.typ) in
            ()
        | Pow ->
            (* Todo : allow unit in the left op ? *)
            let* _ = unify typ (number_with_unit ~pos Units.empty) in
            let* _ = unify left.typ (number_with_unit ~pos Units.empty) in
            let+ _ = unify right.typ (number_with_unit ~pos Units.empty) in
            ()
        | Gt | Lt | LtEq | GtEq | Eq | NotEq ->
            let* _ = unify typ (literal ~pos Bool) in
            let+ _ = unify left.typ right.typ in
            () )
    | Unary_op ((op, _), expr) -> (
      match op with
      | Neg ->
          let* _ = unify_computation expr in
          let* _ = unify expr.typ (any_number ~pos ()) in
          let+ _ = unify typ expr.typ in
          ()
      | Is_undef ->
          let* _ = unify_computation expr in
          let+ _ = unify typ (literal ~pos Bool) in
          () )
    | Condition (cond_expr, then_expr, else_expr) ->
        let* _ = unify_computation cond_expr in
        let* _ = unify_computation then_expr in
        let* _ = unify_computation else_expr in
        let* _ = unify cond_expr.typ (literal ~pos Bool) in
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
