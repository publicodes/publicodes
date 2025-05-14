open Core
open Utils
open Shared
open Utils.Output
module Cycle_analysis = Graph.Cycles.Johnson (Rule_graph)

let cycle_check ~filename (tree : Eval.Tree.t) : Rule_graph.t Output.t =
  let graph = Rule_graph.mk tree in
  let log_cycle cycle acc =
    let cycle = List.rev cycle in
    let cycle = cycle @ [List.hd_exn cycle] in
    let log =
      (* Todo better error message for cycle *)
      Log.warning ~kind:`Cycle
        "Un cycle a été detecté pour l'évaluation de cette règle"
        ~pos:(Pos.beginning_of_file filename)
        ~hint:
          (String.concat ~sep:" -> "
             (List.map cycle ~f:(fun rule ->
                  Format.asprintf "%a" Rule_name.pp rule ) ) )
    in
    log :: acc
  in
  let logs = Cycle_analysis.fold_cycles log_cycle graph [] in
  return ~logs graph
