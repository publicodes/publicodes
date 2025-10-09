open Utils
open Shared

val extract_outputs :
     ast:'a Shared_ast.t
  -> eval_tree:Hashed_tree.t
  -> Rule_graph.G.t
  -> Model_outputs.t Output.t
(** Extracts the public outputs of a model from its AST and dependency graph.

    This function identifies all rules marked as public in the AST and computes their
    dependencies (parameters). It also adds metadata and type information to each output.

    @param ast The abstract syntax tree of the model
    @param eval_tree The evaluation tree containing metadata and positions
    @param graph The dependency graph of the model
    @return A list of model outputs with their metadata and dependencies, wrapped in an Output.t *)
