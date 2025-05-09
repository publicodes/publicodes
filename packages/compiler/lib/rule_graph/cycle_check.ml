open Core
open Utils
open Shared
open Utils.Output
open Rule_graph_type
module Cycle_analysis = Graph.Cycles.Johnson (G)

let cycle_check (graph : G.t) : unit Output.t =
  let log_cycle cycle acc =
    let cycle = List.rev cycle in
    let first_rule = List.hd_exn cycle in
    let cycle = cycle @ [List.hd_exn cycle] in
    let log =
      (* Todo better error message for cycle *)
      Log.warning ~kind:`Cycle
        "Un cycle a été detecté pour l'évaluation de cette règle"
        ~pos:(Pos.pos first_rule)
        ~hint:
          (String.concat ~sep:" -> "
             (List.map cycle ~f:(fun rule ->
                  Format.asprintf "%a" Rule_name.pp (Pos.value rule) ) ) )
    in
    log :: acc
  in
  let logs = Cycle_analysis.fold_cycles log_cycle graph [] in
  return ~logs ()
