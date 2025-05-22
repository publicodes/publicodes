open Core
open Utils
open Shared
open Utils.Output
module Cycle_analysis = Graph.Cycles.Johnson (Rule_graph)

let cycle_check (tree : Eval.Tree.t) : Rule_graph.t Output.t =
  let graph = Rule_graph.mk tree in
  let log_cycle cycle acc =
    let cycle = List.rev cycle in
    let first_rule_name = List.hd_exn cycle in
    let cycle = cycle @ [first_rule_name] in
    let pos = Eval.Tree.get_pos tree first_rule_name in
    let code, message = Err.cycle_detected in
    let log =
      (* TODO: better error message for cycle *)
      Log.warning message ~code ~kind:`Cycle ~pos
        ~hints:
          [ String.concat ~sep:" -> "
              (List.map cycle ~f:(fun rule ->
                   Format.asprintf "%a" Rule_name.pp rule ) ) ]
    in
    log :: acc
  in
  let logs = Cycle_analysis.fold_cycles log_cycle graph [] in
  return ~logs graph
