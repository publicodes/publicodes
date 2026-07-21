open Utils
open Shared

val extract_outputs :
     ast:Shared_ast.resolved
  -> eval_tree:Hashed_tree.t
  -> warn_types:bool
  -> Rule_graph.t
  -> Model_output.t list Output.t
