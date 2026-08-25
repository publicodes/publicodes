open Utils.Output.Let_syntax
module Dependency_graph = Dependency_graph
module Replacement_graph = Replacement_graph

type t =
  { replacement_graph: Replacement_graph.t
  ; make_not_applicable_graph: Replacement_graph.t
  ; dependency_graph: Dependency_graph.t }

let mk_and_checks resolved_ast =
  let* replacement_graph, make_not_applicable_graph =
    Replacement_graph.mk_and_checks resolved_ast
  in
  let* dependency_graph =
    Dependency_graph.mk_and_checks resolved_ast ~replacement_graph
      ~make_not_applicable_graph
  in
  return {replacement_graph; make_not_applicable_graph; dependency_graph}

let extract_outputs = Extract_outputs.extract_outputs
