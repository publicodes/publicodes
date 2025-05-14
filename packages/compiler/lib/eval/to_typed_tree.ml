open Eval_tree.Raw
open Type_database
open Type_check
open Utils.Output

let to_typed_tree tree =
  let* database = type_check tree in
  let add_type meta =
    let id = resolve_symlink_and_compress ~database meta.id in
    let typ =
      match database.(id) with
      | Null ->
          None
      | Link _ ->
          failwith "Unexpected link after resolving symlinks"
      | Concrete typ ->
          Some typ
    in
    {meta with typ}
  in
  return (map_meta_tree add_type tree)
