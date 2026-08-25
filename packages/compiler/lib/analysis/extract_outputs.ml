open Base
open Shared
open Utils
open Utils.Output
module Rule_context = Dependency_graph.Rule_context
module Dependency_graph = Dependency_graph.Rule_graph

let is_parameter rule_name ~ast =
  let rule_def = Shared_ast.find_exn rule_name ast in
  not (Shared_ast.has_value rule_def)

let extract_parameters rule_name ~graph ~ast : Rule_name.t * Rule_name.t list =
  let transitive_dependencies =
    Dependency_graph.Oper.transitive_closure ~reflexive:false graph
  in
  let successor_rules =
    Dependency_graph.succ transitive_dependencies (rule_name, [])
  in
  let parameter_rules =
    List.filter successor_rules ~f:(fun (dep_rule_name, dep_context_stack) ->
        let is_overridden_by_context =
          Rule_context.stack_contains dep_context_stack dep_rule_name
        in
        (not is_overridden_by_context) && is_parameter dep_rule_name ~ast )
    |> List.map ~f:fst
  in
  (rule_name, List.stable_dedup parameter_rules ~compare:Rule_name.compare)

let add_self_dependencies_for_parameters ~(graph : Dependency_graph.t)
    ~(ast : Shared_ast.typed) : unit =
  List.iter ast ~f:(fun rule_def ->
      let rule_name = Mark.remove rule_def.name in
      if is_parameter rule_name ~ast then
        Dependency_graph.add_edge graph (rule_name, []) (rule_name, []) )

let get_missing_type_warnings_opt ({rule_name; typ; _} : Model_output.t) ~ast :
    Log.t option =
  match typ with
  | None ->
      let code, message = Err.missing_output_type in
      let pos = Shared_ast.get_pos_exn ast rule_name in
      Some
        (Log.warning ~code ~pos ~kind:`Type
           ~hints:
             [ "Spécifiez le type de la règle."
             ; Stdlib.Format.asprintf "Par exemple :\n\n%a:\n  type: nombre"
                 Rule_name.pp rule_name ]
           message )
  | Some (TNumber None) ->
      let code, message = Err.missing_output_type in
      let pos = Shared_ast.get_pos_exn ast rule_name in
      Some
        (Log.warning ~code ~pos ~kind:`Type
           ~hints:["Spécifiez l'unité de la règle. Par exemple : `unité: €`"]
           message )
  | Some _ ->
      None

let extract_outputs (graph : Dependency_graph.t) ~(ast : Shared_ast.typed)
    ~(warn_types : bool) : Model_output.t list Output.t =
  let graph = Dependency_graph.copy graph in
  add_self_dependencies_for_parameters ~graph ~ast ;
  let wrap_meta ~is_output (rule_name, parameters) =
    let Shared_ast.{meta; value; _} = Shared_ast.find_exn rule_name ast in
    let Shared_ast.{typ; _} = Mark.get value in
    (* Stdlib.Printf.printf "\ntype: %s for value:\n%s\n" *)
    (*   (match typ with None -> "None" | Some t -> Typ.to_string t) *)
    (*   (Shared_ast.show_value Rule_name.pp Shared_ast.pp_typed_mark value) ; *)
    Model_output.{rule_name; parameters; typ; meta; is_output}
  in
  let output_parameters =
    List.filter_map ast ~f:(fun rule_def ->
        let rule_name = Mark.remove rule_def.name in
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
  let rules =
    (* FIXME: this seems hacky and highly reliant on wich comes first between
       outputs and parameters. Outputs that are also paramters will only be
       considered as parameters. *)
    List.stable_dedup (outputs @ parameters) ~compare:(fun a b ->
        Rule_name.compare a.rule_name b.rule_name )
  in
  if warn_types then
    let warnings =
      List.filter_map rules ~f:(get_missing_type_warnings_opt ~ast)
    in
    return ~logs:warnings rules
  else return rules
