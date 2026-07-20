include module type of Tree

module Type : sig
  include module type of Type
end

val from_resolved_ast :
  Shared.Shared_ast.resolved -> Type.t Tree.t Utils.Output.t

val type_check : Type.t Tree.t -> Type.t Tree.t Utils.Output.t
