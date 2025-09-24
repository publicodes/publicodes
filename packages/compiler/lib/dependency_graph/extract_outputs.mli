open Utils
open Shared

val extract_outputs :
     ast:'a Shared_ast.t
  -> eval_tree:Hashed_tree.t
  -> Rule_graph.G.t
  -> Model_outputs.t Output.t
