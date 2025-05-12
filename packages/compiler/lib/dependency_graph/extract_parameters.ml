open Core
open Shared
open Shared.Shared_ast
open Utils
open Rule_graph
module Oper = Graph.Oper.I (G)
module Traverse = Graph.Traverse.Dfs (G)

let extract_parameters ~(ast : Shared_ast.resolved) (graph : G.t) =
  let transitive_dependencies = Oper.transitive_closure ~reflexive:true graph in
  List.filter_map ast ~f:(fun rule_def ->
      let rule_name = Pos.value rule_def.name in
      if has_public_tag rule_def then
        Some
          ( rule_name
          , List.filter ~f:(fun r ->
                let rule =
                  List.find_exn
                    ~f:(fun rule ->
                      Rule_name.compare (Pos.value rule.name) r = 0 )
                    ast
                in
                not (Shared_ast.has_value rule) )
            @@ G.succ transitive_dependencies rule_name )
      else None )
