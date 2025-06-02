open Utils
open Shared

val extract_parameters :
     ast:Shared_ast.resolved
  -> eval_tree:Eval.Typed_tree.t
  -> Rule_graph.G.t
  -> Eval.Parameters.t Output.t
