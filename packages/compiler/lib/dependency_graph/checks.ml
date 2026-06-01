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
  let log_illegal (rule_a, pos, rule_b) acc =
    let rule_def_a = Shared_ast.find rule_a ast in
    let rule_def_b = Shared_ast.find rule_b ast in
    let module_a = Shared_ast.get_module_id_exn rule_def_a in
    let module_b = Shared_ast.get_module_id_exn rule_def_b in
    if not (Module_id.is_parent module_a module_b) then
      let code, message = Err.illegal_reference in
      Log.error ~pos ~kind:`Syntax ~code message
        ~hints:
          [ Stdlib.Format.asprintf
              "La rêgle `%a` n'est pas accessible depuis ce module" Rule_name.pp
              rule_b ]
      :: acc
    else if
      (not (Module_id.equal module_a module_b))
      && (not (Shared_ast.has_public_tag rule_def_b))
      && Shared_ast.has_value rule_def_b
    then
      let code, message = Err.private_rule in
      Log.error ~pos ~kind:`Syntax ~code message
        ~hints:
          [ Stdlib.Format.asprintf "La rêgle `%a` n'est pas exportée"
              Rule_name.pp rule_b
          ; "Ajouter l'attribut public sur la rêgle référencé" ]
      :: acc
    else acc
  in
  Rule_graph.fold_edges_e log_illegal graph []

let unused_context_check (tree : 'a Eval_tree.t) (dep_graph : Rule_graph.t)
    (cont_graph : Rule_graph.t) : Log.t list =
  let rec is_used from ctx =
    let ctxs = Rule_graph.succ cont_graph from in
    let deps = Rule_graph.succ dep_graph from in
    if List.exists ctxs ~f:(Rule_name.equal ctx) then
      (* the context is overrode here *)
      false
    else if List.exists deps ~f:(Rule_name.equal ctx) then
      (* the context is actually used here *)
      true
    else (* continue crawling *)
      List.exists deps ~f:(fun ref -> is_used ref ctx)
  in
  let log_unused from acc =
    let unused_ctxs =
      let deps = Rule_graph.succ dep_graph from in
      (* we filter out contexts immediately used *)
      let ctxs =
        Rule_graph.succ cont_graph from
        |> List.filter ~f:(fun ctx ->
            List.exists deps ~f:(Rule_name.equal ctx) |> not )
      in
      List.filter ctxs ~f:(fun ctx ->
          List.for_all deps ~f:(fun ref -> is_used ref ctx |> not) )
    in
    if List.is_empty unused_ctxs then acc
    else
      let pos = get_pos tree from in
      let code, message = Err.unused_context in
      let unused_ctxs =
        List.map unused_ctxs ~f:Rule_name.show |> String.concat ~sep:", "
      in
      Log.error ~pos ~kind:`Syntax ~code message
        ~hints:
          [ Stdlib.Format.asprintf "ces contextes ne sont pas utilisés : %s"
              unused_ctxs ]
      :: acc
  in
  Rule_graph.fold_vertex log_unused dep_graph []

let checks ~(ast : 'a Shared_ast.t) ~(eval_tree : Hashed_tree.t) :
    (Rule_graph.t * Rule_graph.t) Output.t =
  let dep_graph = Rule_graph.mk eval_tree in
  let cont_graph = Rule_graph.mk_context eval_tree in
  let cycle_logs = cycle_check eval_tree dep_graph in
  let access_logs = illegal_check ast dep_graph in
  let context_logs = unused_context_check eval_tree dep_graph cont_graph in
  return ~logs:(cycle_logs @ access_logs @ context_logs) (dep_graph, cont_graph)
