open Eval_tree.Raw
open Type_database
open Type_check
open Utils.Output
open Core

let to_typed_tree tree =
  let* database = type_check tree in
  let add_type meta =
    let id = resolve_symlink_and_compress ~database meta.id in
    let typ =
      match database.(id) with
      | Null ->
          None
      | Link _ ->
          None
      | Concrete typ ->
          Some typ
    in
    {meta with typ}
  in
  let tree_with_type = map_meta_tree add_type tree in
  (* let computation =
    Hashtbl.find_exn tree_with_type
      (Shared.Rule_name.create_exn
         [ "dirigeant"
         ; "auto-entrepreneur"
         ; "cotisations et contributions"
         ; "cotisations"
         ; "service BNC" ] )
  in
  Format.printf "%a" Eval_tree.Typed.pp_computation computation ; *)
  return tree_with_type
