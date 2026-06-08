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

let unused_context_check (tree : 'a Eval_tree.t) (graph : Rule_graph.t) :
    Log.t list =
  let rec is_used ctx froms =
    match froms with
    | [] ->
        false
    | from :: rest ->
        let ctxs =
          let rule_def = Eval_tree.get_value tree from in
          Eval_tree.get_contexts rule_def |> List.map ~f:Pos.value
        in
        let deps = Rule_graph.succ graph from in
        if List.exists ctxs ~f:(Rule_name.equal ctx) then
          (* the context is override here *)
          is_used ctx rest
        else if List.exists deps ~f:(Rule_name.equal ctx) then
          (* the context is actually used here *)
          true
        else is_used ctx (rest @ deps)
  in
  let log_unused from acc =
    let unused_ctxs =
      let deps = Rule_graph.succ graph from in
      (* we filter out contexts immediately used *)
      let ctxs =
        let rule_def = Eval_tree.get_value tree from in
        Eval_tree.get_contexts rule_def
        |> List.filter ~f:(fun (ctx, _) ->
            List.exists deps ~f:(Rule_name.equal ctx) |> not )
      in
      List.filter ctxs ~f:(fun (ctx, _) -> not (is_used ctx deps))
    in
    if List.is_empty unused_ctxs then acc
    else
      let code, message = Err.unused_context in
      let labels =
        List.map unused_ctxs ~f:(fun (_, pos) ->
            Pos.mk ~pos "contexte inutilisé" )
      in
      Log.error ~labels ~kind:`Syntax ~code message :: acc
  in
  Rule_graph.fold_vertex log_unused graph []

let checks ~(ast : 'a Shared_ast.t) ~(eval_tree : Hashed_tree.t) :
    Rule_graph.t Output.t =
  let graph = Rule_graph.mk eval_tree in
  let cycle_logs = cycle_check eval_tree graph in
  let access_logs = illegal_check ast graph in
  let context_logs = unused_context_check eval_tree graph in
  let logs = cycle_logs @ access_logs @ context_logs in
  return ~logs graph
