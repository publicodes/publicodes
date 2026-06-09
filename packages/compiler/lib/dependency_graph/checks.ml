open Base
open Utils
open Shared
open Utils.Output
open Shared.Eval_tree
module Cycle_analysis = Graph.Cycles.Johnson (Rule_graph)

let cycle_check (tree : 'a Eval_tree.t) (graph : Rule_graph.t) : Log.t list =
  let log_cycle cycle acc =
    let cycle =
      List.map cycle ~f:(fun (rule_name, _) -> rule_name) |> List.rev
    in
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
  let log_illegal ((rule_a, _), pos, (rule_b, _)) acc =
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

(** In the dependency graph, a [ctx_rule] is used only if there is at least one
    dependency node with:
     - the same rule as [ctx_rule],
     - the deepest context containing [ctx_rule] is the same as the [current_ctx].
   *)
let is_rule_used_in_deps ctx_rule (current_ctx : Rule_context.t)
    (deps : (Rule_name.t * Rule_context.t list) list) : bool =
  let deps_using_ctx_rule =
    List.filter deps ~f:(fun (dep_rule, dep_ctx_stack) ->
        if Rule_name.equal ctx_rule dep_rule then
          match
            (* NOTE: this works because the context stack in the [Rule_graph] is
               ordered from the deepest context to the shallowest one, so the
               first context containing [ctx_rule] is the deepest one. *)
            List.find dep_ctx_stack ~f:(Rule_context.contains ctx_rule)
          with
          | Some c ->
              Rule_context.equal current_ctx c
          | _ ->
              false
        else false )
  in
  not (List.is_empty deps_using_ctx_rule)

let get_unused_rules_in_deps deps ctx : Rule_name.t Pos.t list =
  Rule_context.rules ctx
  |> List.filter ~f:(fun rule ->
      not (is_rule_used_in_deps (Pos.value rule) ctx deps) )

let unused_context_check (ast : Shared_ast.resolved) (graph : Rule_graph.t) :
    Log.t list =
  let graph = Rule_graph.Oper.transitive_closure graph in
  List.fold ast ~init:[] ~f:(fun acc rule_def ->
      let rule_name = Pos.value rule_def.name in
      let ctxs = Rule_context.from_rule_def rule_def in
      let from = Rule_graph.root_vertex rule_name in
      let deps = Rule_graph.succ graph from in
      let unused_ctxs =
        List.map ctxs ~f:(get_unused_rules_in_deps deps)
        |> List.filter ~f:(fun c -> not (List.is_empty c))
      in
      if List.is_empty unused_ctxs then acc
      else
        List.concat_map unused_ctxs ~f:(fun unused_ctx_rules ->
            let code, message = Err.unused_context in
            let labels =
              (* TODO: should also provide the position of the context overriding
             the unused context, if any. *)
              List.rev_map unused_ctx_rules ~f:(fun (_, pos) ->
                  Pos.mk ~pos "contexte inutilisé" )
            in
            Log.error ~labels ~kind:`Syntax ~code message :: acc ) )

let checks ~(ast : Shared_ast.resolved) ~(eval_tree : Hashed_tree.t) :
    Rule_graph.t Output.t =
  let graph = Rule_graph.mk ast in
  let cycle_logs = cycle_check eval_tree graph in
  let access_logs = illegal_check ast graph in
  let context_logs = unused_context_check ast graph in
  let logs = cycle_logs @ access_logs @ context_logs in
  break ~logs graph
