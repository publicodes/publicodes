open Base
open Shared
open Utils
open Utils.Output

let is_parameter rule_name ~(ast : 'a Shared_ast.t) : bool =
  let rule_def = Shared_ast.find rule_name ast in
  not (Shared_ast.has_value rule_def)

let extract_parameters rule_name ~(graph : Rule_graph.t) ~(ast : 'a Shared_ast.t)
    : Rule_name.t * Rule_name.t list =
  let transitive_dependencies =
    Rule_graph.Oper.transitive_closure ~reflexive:false graph
  in
  let successor_rules =
    Rule_graph.succ transitive_dependencies (rule_name, [])
  in
  let parameter_rules =
    List.filter successor_rules ~f:(fun (dep_rule_name, dep_context_stack) ->
        let is_overridden_by_context =
          List.exists dep_context_stack ~f:(Rule_context.contains dep_rule_name)
        in
        (not is_overridden_by_context) && is_parameter dep_rule_name ~ast )
    |> List.map ~f:fst
  in
  (rule_name, List.stable_dedup parameter_rules ~compare:Rule_name.compare)

let add_self_dependencies_for_parameters ~(graph : Rule_graph.t)
    ~(ast : 'a Shared_ast.t) : unit =
  List.iter ast ~f:(fun rule_def ->
      let rule_name = Pos.value rule_def.name in
      if is_parameter rule_name ~ast then
        Rule_graph.add_edge graph (rule_name, []) (rule_name, []) )

let get_missing_type_warnings_opt ({rule_name; typ; _} : Model_output.t)
    ~(eval_tree : Hashed_tree.t) : Log.t option =
  match typ with
  | None ->
      let code, message = Err.missing_output_type in
      let pos = Eval_tree.get_pos eval_tree rule_name in
      Some
        (Log.warning ~code ~pos ~kind:`Type
           ~hints:
             [ "Spécifiez le type de la règle. Par exemple : `type: texte`"
             ; Stdlib.Format.asprintf "%a" Rule_name.pp rule_name ]
           message )
  | Some (Number None) ->
      let code, message = Err.missing_output_type in
      let pos = Eval_tree.get_pos eval_tree rule_name in
      Some
        (Log.warning ~code ~pos ~kind:`Type
           ~hints:["Spécifiez l'unité de la règle. Par exemple : `unité: €`"]
           message )
  | Some _ ->
      None

let extract_outputs ~(ast : 'a Shared_ast.t) ~(eval_tree : Hashed_tree.t)
    ~(warn_types : bool) (graph : Rule_graph.t) : Model_output.t list Output.t =
  (* NOTE: this is a side-effect on the [graph], could it be problematic? *)
  add_self_dependencies_for_parameters ~graph ~ast ;
  let wrap_meta ~is_output (rule_name, parameters) =
    Model_output.
      { rule_name
      ; parameters
      ; typ= (Eval_tree.get_meta eval_tree rule_name).typ
      ; meta= (Shared_ast.find rule_name ast).meta
      ; is_output }
  in
  let output_parameters =
    List.filter_map ast ~f:(fun rule_def ->
        let rule_name = Pos.value rule_def.name in
        let module_id = Shared_ast.get_module_id_exn rule_def in
        if Shared_ast.has_public_tag rule_def && Module_id.is_root module_id
        then Some (extract_parameters rule_name ~graph ~ast)
        else None )
  in
  let outputs = List.map ~f:(wrap_meta ~is_output:true) output_parameters in
  let parameters =
    List.concat_map ~f:snd output_parameters
    |> List.stable_dedup ~compare:Rule_name.compare
    |> List.map ~f:(extract_parameters ~graph ~ast)
    |> List.map ~f:(wrap_meta ~is_output:false)
  in
  let rules = parameters @ outputs in
  if warn_types then
    let warnings =
      List.filter_map rules ~f:(get_missing_type_warnings_opt ~eval_tree)
    in
    return ~logs:warnings rules
  else return rules
