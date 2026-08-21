open Base
open Shared
open Utils
open Utils.Output
module Rule_context = Dependency_graph.Rule_context
module Dependency_graph = Dependency_graph.Rule_graph
open Dependency_graph

(* TODO: Optimization: do not re-compute same nodes. *)
let rec extract_parameters ?(done_ = []) ((rule_name, ctxs) as cur_vertex)
    ~graph ~ast : Rule_name.t * Rule_name.t list =
  if List.exists done_ ~f:(Rule_vertex.equal cur_vertex) then (rule_name, [])
  else
    let done_ = cur_vertex :: done_ in
    let successors = Dependency_graph.succ graph cur_vertex in
    let rule_dep =
      let rule_def = Shared_ast.find_exn rule_name ast in
      let self_dep =
        if
          (not (Shared_ast.has_value rule_def))
          && not (Rule_context.stack_contains ctxs rule_name)
        then [rule_name]
        else []
      in
      let root_finding_withs =
        let value = Mark.remove rule_def.value in
        match Mark.remove value.value with
        | Root_finding root_finding ->
            List.map root_finding.with_ ~f:Mark.remove
        | _ ->
            []
      in
      let root_finding_reverts =
        List.filter_map successors ~f:(fun (succ_rule_name, _) ->
            let rule_def = Shared_ast.find_exn succ_rule_name ast in
            let value = Mark.remove rule_def.value in
            match Mark.remove value.value with
            | Root_finding root_finding ->
                if
                  List.map root_finding.with_ ~f:Mark.remove
                  |> List.exists ~f:(fun a ->
                      List.map done_ ~f:fst
                      |> List.exists ~f:(fun b -> Rule_name.equal a b) )
                then Some succ_rule_name
                else None
            | _ ->
                None )
      in
      self_dep @ root_finding_withs @ root_finding_reverts
    in
    let parameter_rules =
      successors
      |> List.concat_map ~f:(fun dep_vertex ->
          extract_parameters ~done_ dep_vertex ~graph ~ast |> snd )
      |> List.filter ~f:(fun this -> not (Rule_name.equal rule_name this))
    in
    let dependencies =
      rule_dep @ parameter_rules
      |> List.dedup_and_sort ~compare:Rule_name.compare
    in
    (rule_name, dependencies)

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
  let wrap_meta ~is_output (rule_name, parameters) =
    let Shared_ast.{meta; value; _} = Shared_ast.find_exn rule_name ast in
    let Shared_ast.{typ; _} = Mark.get value in
    let meta = List.map meta ~f:Mark.remove in
    Model_output.{rule_name; parameters; typ; meta; is_output}
  in
  let output_parameters =
    List.filter_map ast ~f:(fun rule_def ->
        let rule_name = Mark.remove rule_def.name in
        if
          Shared_ast.has_public_tag rule_def
          && Module_id.is_root rule_def.module_id
        then
          Some
            (extract_parameters
               (Dependency_graph.root_vertex rule_name)
               ~graph ~ast )
        else None )
  in
  let outputs = List.map ~f:(wrap_meta ~is_output:true) output_parameters in
  let parameters =
    List.concat_map ~f:snd output_parameters
    |> List.stable_dedup ~compare:Rule_name.compare
    |> List.map ~f:(fun rule_name ->
        extract_parameters (Dependency_graph.root_vertex rule_name) ~graph ~ast )
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
