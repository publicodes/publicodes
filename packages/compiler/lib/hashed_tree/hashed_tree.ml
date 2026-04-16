type t = Tree.t

let to_js_str = To_string.to_js

let to_debug_str = To_string.to_debug

let to_yaml_str = To_yaml.to_str

let from_typed_tree tree = From_typed_tree.from_typed_tree tree
