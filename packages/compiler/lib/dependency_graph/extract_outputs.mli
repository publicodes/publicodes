open Utils
open Shared

val extract_outputs :
     ast:'a Shared_ast.t
  -> eval_tree:Hashed_tree.t
  -> warn_types:bool
  -> Rule_graph.G.t
  -> Model_output.t list Output.t
