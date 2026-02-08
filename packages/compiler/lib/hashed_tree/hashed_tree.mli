type t = Tree.t

val to_js : t -> Shared.Model_outputs.t -> string

val from_typed_tree : Typed_tree.t -> t
