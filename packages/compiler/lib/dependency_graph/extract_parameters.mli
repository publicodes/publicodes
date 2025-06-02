open Utils
open Shared

val extract_parameters :
     ast:Shared_ast.resolved
  -> tree:Hashed_tree.t
  -> Rule_graph.G.t
  -> Shared.Parameters.t Output.t
