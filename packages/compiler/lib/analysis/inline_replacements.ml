open Base
open Shared
open Utils

let inline ~replacement_graph ~make_not_applicable_graph
    (ast : Shared_ast.resolved) : Shared_ast.inlined =
  List.map ast ~f:(fun rule ->
      let from = Mark.remove rule.name in
      let resolve rule =
        Replacement_graph.resolve ~from ~replacement_graph
          ~make_not_applicable_graph ~rule
      in
      Shared_ast.map_rule_def resolve Fn.id rule )
