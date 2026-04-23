open Base
open Utils
open Shared
open Utils.Output
open Shared.Eval_tree
module Cycle_analysis = Graph.Cycles.Johnson (Rule_graph)

let cycle_check (tree : 'a Eval_tree.t) (graph : Rule_graph.t) : Log.t list =
  let log_cycle cycle acc =
    let cycle = List.rev cycle in
    let first_rule_name = List.hd_exn cycle in
    let cycle = cycle @ [first_rule_name] in
    let pos = get_pos tree first_rule_name in
    let code, message = Err.cycle_detected in
    let log =
      (* TODO: better error message for cycle *)
      Log.warning message ~code ~kind:`Cycle ~pos
        ~hints:
          [ String.concat ~sep:" -> "
              (List.map cycle ~f:(fun rule ->
                   Stdlib.Format.asprintf "%a" Rule_name.pp rule ) ) ]
    in
    log :: acc
  in
  Cycle_analysis.fold_cycles log_cycle graph []

let illegal_check (ast : 'a Shared_ast.t) (graph : Rule_graph.t) : Log.t list =
  let is_child parent child =
    let parentz = List.length parent in
    let childz = List.length child in
    if childz < parentz then false
    else
      let prefix = List.take child parentz in
      List.equal ( = ) parent prefix
  in
  let log_illegal (rule_a, pos, rule_b) acc =
    let rule_def_a = Shared_ast.find rule_a ast in
    let rule_def_b = Shared_ast.find rule_b ast in
    let module_a = Shared_ast.module_id rule_def_a in
    let module_b = Shared_ast.module_id rule_def_b in
    if not (is_child module_a module_b) then
      let code, message = Err.illegal_reference in
      Log.error ~pos ~kind:`Syntax ~code message
        ~hints:
          [ Stdlib.Format.asprintf
              "La rêgle `%a` n'est pas accessible depuis ce module" Rule_name.pp
              rule_b ]
      :: acc
    else if
      (not (List.equal ( = ) module_a module_b))
      && (not (Shared_ast.has_public_tag rule_def_b))
      && Shared_ast.has_value rule_def_b
    then
      let code, message = Err.private_rule in
      Log.error ~pos ~kind:`Syntax ~code message
        ~hints:
          [ Stdlib.Format.asprintf "La rêgle `%a` est privée" Rule_name.pp rule_b
          ; "Ajouter l'attribut public sur la rêgle référencé" ]
      :: acc
    else acc
  in
  Rule_graph.fold_edges_e log_illegal graph []

let checks ~(ast : 'a Shared_ast.t) ~(eval_tree : Hashed_tree.t) :
    Rule_graph.t Output.t =
  let graph = Rule_graph.mk eval_tree in
  let cycle_logs = cycle_check eval_tree graph in
  let access_logs = illegal_check ast graph in
  return ~logs:(cycle_logs @ access_logs) graph
