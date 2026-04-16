type t = Tree.t

type value = Tree.value

val to_jingoo_models : t -> Shared.Model_outputs.t -> Utils.Template.t

val from_typed_tree : Typed_tree.t -> t
