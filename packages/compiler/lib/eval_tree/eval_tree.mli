open Shared

include module type of Tree

val from_typed_ast : Shared_ast.typed -> Typ.t option Tree.t
