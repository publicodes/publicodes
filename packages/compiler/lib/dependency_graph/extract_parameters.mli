open Utils
open Shared

val extract_parameters :
     ast:'a Shared_ast.t
  -> tree:Hashed_tree.t
  -> Rule_graph.G.t
  -> Shared.Parameters.t Output.t
