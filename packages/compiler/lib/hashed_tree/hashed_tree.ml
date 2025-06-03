include Tree

let to_json = To_json.to_json

let from_typed_tree tree =
  let tree = From_typed_tree.from_typed_tree tree in
  (* Format.printf "%a" Tree.pp tree ; *)
  tree
