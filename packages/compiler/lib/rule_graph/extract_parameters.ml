open Core
open Shared
open Rule_graph_type
module Oper = Graph.Oper.I (G)
module Traverse = Graph.Traverse.Dfs (G)

let transitive_dependencies (graph : G.t) : G.t =
  Oper.transitive_closure ~reflexive:true graph
