open Utils
open Shared

val extract_outputs :
     Dependency_graph.t
  -> ast:Shared_ast.typed
  -> warn_types:bool
  -> Model_output.t list Output.t
