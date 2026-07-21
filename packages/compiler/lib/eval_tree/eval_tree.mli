include module type of Tree

module Type : sig
  include module type of Type
end

val from_resolved_ast :
     replacement_graph:Replacement_graph.Rule_graph.t
  -> make_not_applicable_graph:Replacement_graph.Rule_graph.t
  -> Shared.Shared_ast.resolved
  -> Type.t Tree.t Utils.Output.t

val type_check : Type.t Tree.t -> Type.t Tree.t Utils.Output.t
