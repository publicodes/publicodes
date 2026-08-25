open Shared
module Dependency_graph = Dependency_graph
module Replacement_graph = Replacement_graph

type t =
  { replacement_graph: Replacement_graph.t
  ; make_not_applicable_graph: Replacement_graph.t
  ; dependency_graph: Dependency_graph.t }

val mk_and_checks : Shared_ast.resolved -> t Utils.Output.t
(** [mk_and_checks resolved_ast] constructs and performs checks on the
    replacement graph, make-not-applicable graph, and dependency graph based on
    the provided [resolved_ast]. *)

val extract_outputs :
     Dependency_graph.t
  -> ast:Shared_ast.typed
  -> warn_types:bool
  -> Model_output.t list Utils.Output.t
(** [extract_outputs dependency_graph ~ast ~warn_types ] extracts the
    public outputs of a model from its [dependency_graph].

    This function identifies all rules marked as public in the AST and computes
    their dependencies (parameters). It also adds metadata and type information
    to each output retrieved respectively from the typed [ast]. *)
