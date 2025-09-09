open Utils
open Core
open Utils.Output
open Typ
open Shared
open Shared.Shared_ast
open Shared.Eval_tree

let type_check ?(snd_pass = false) (tree : Tree.t) =
  let rec unify_value {meta= typ; pos; value} =
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
        let* _ = unify_value left in
        let* _ = unify_value right in
        match operator with
        | And | Or ->
            let* _ = unify typ (literal ~pos Bool) in
            let* _ = unify left.meta (literal ~pos Bool) in
            let+ _ = unify right.meta (literal ~pos Bool) in
            ()
        | Add | Sub | Max | Min ->
            let* _ = unify left.meta (any_number ~pos ()) in
            let* _ = unify right.meta (any_number ~pos ()) in
            let* _ = unify right.meta left.meta in
            let+ _ = unify typ left.meta in
            ()
        | Mul ->
            let* _ = unify left.meta (any_number ~pos ()) in
            let* _ = unify right.meta (any_number ~pos ()) in
            let+ _ = unify typ (multiply ~pos right.meta left.meta) in
            ()
        | Div ->
            let* _ = unify left.meta (any_number ~pos ()) in
            let* _ = unify right.meta (any_number ~pos ()) in
            let+ _ = unify typ (divide ~pos left.meta right.meta) in
            ()
        | Pow ->
            (* Todo : allow unit in the left op ? *)
            let* _ = unify typ (number_with_unit ~pos Units.empty) in
            let* _ = unify left.meta (number_with_unit ~pos Units.empty) in
            let+ _ = unify right.meta (number_with_unit ~pos Units.empty) in
            ()
        | Gt | Lt | LtEq | GtEq | Eq | NotEq ->
            let* _ = unify typ (literal ~pos Bool) in
            let+ _ = unify left.meta right.meta in
            () )
    | Unary_op ((op, _), expr) -> (
      match op with
      | Neg ->
          let* _ = unify_value expr in
          let* _ = unify expr.meta (any_number ~pos ()) in
          let+ _ = unify typ expr.meta in
          ()
      | Is_undef ->
          let* _ = unify_value expr in
          let+ _ = unify typ (literal ~pos Bool) in
          () )
    | Condition (cond_expr, then_expr, else_expr) ->
        let* _ = unify_value cond_expr in
        let* _ = unify_value then_expr in
        let* _ = unify_value else_expr in
        let* _ = unify cond_expr.meta (literal ~pos Bool) in
        let* _ = unify then_expr.meta else_expr.meta in
        let+ _ = unify typ then_expr.meta in
        ()
    | Ref ref_name ->
        (* return () *)
        let rule = Hashtbl.find_exn tree ref_name in
        let+ _ = unify typ rule.meta in
        ()
    | Get_context _ ->
        return ()
        (* let _, ref_meta = Hashtbl.find_exn tree name in
          unify  meta ref_meta *)
    | Set_context {context= ctx; value= ctx_value} ->
        let* _ = unify_value ctx_value in
        let* _ = unify typ ctx_value.meta in
        let* _ =
          List.map ctx ~f:(fun (rule_name, value) ->
              let* _ = unify_value value in
              let rule = Hashtbl.find_exn tree (Pos.value rule_name) in
              let+ _ = unify rule.meta value.meta in
              () )
          |> all_keep_logs
        in
        return ()
    | Round value ->
        Mecha_rounding.typecheck ~unify_value ~pos ~snd_pass ~typ value
  in
  let* _ =
    Hashtbl.to_alist tree
    |> List.map ~f:(fun (_, rule) -> unify_value rule)
    |> Output.all_keep_logs
  in
  return tree
