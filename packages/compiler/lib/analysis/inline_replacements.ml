open Base
open Shared
open Utils

let rec resolve ~from ~replacement_graph ~make_not_applicable_graph ~rule :
    Shared_ast.inlined_ref =
  let resolve rule =
    resolve ~from ~replacement_graph ~make_not_applicable_graph ~rule
  in
  { Shared_ast.rule
  ; replaced_by=
      List.map
        (Replacement_graph.find_replacements ~from ~rule replacement_graph)
        ~f:(fun (replaced_by, _) -> resolve replaced_by )
  ; made_not_applicable_by=
      List.map
        (Replacement_graph.find_replacements ~from ~rule
           make_not_applicable_graph ) ~f:(fun (made_not_applicable_by, _) ->
          resolve made_not_applicable_by ) }

let inline ~replacement_graph ~make_not_applicable_graph
    (ast : Shared_ast.resolved) : Shared_ast.inlined =
  List.map ast ~f:(fun rule ->
      let from = Mark.remove rule.name in
      Shared_ast.map_rule_def
        (fun rule ->
          resolve ~from ~replacement_graph ~make_not_applicable_graph ~rule )
        Fn.id rule )
