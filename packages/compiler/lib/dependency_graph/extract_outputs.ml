open Base
open Shared
open Shared.Shared_ast
open Utils
open Rule_graph
open Utils.Output
open Model_outputs
module Oper = Graph.Oper.I (G)
module Traverse = Graph.Traverse.Dfs (G)

let remove_duplicates (a : 'a list) : 'a list =
  Set.to_list @@ Set.Poly.of_list a

let extract_outputs ~(ast : 'a Shared_ast.t) ~(eval_tree : Hashed_tree.t)
    ~(warn_types : bool) ((dep_graph, cont_graph) : G.t * G.t) :
    Model_outputs.t Output.t =
  (* Add self-dependencies for rules without value *)
  List.iter ast ~f:(fun rule_def ->
      let rule_name = Pos.value rule_def.name in
      if not (Shared_ast.has_value rule_def) then
        G.add_edge dep_graph rule_name rule_name ) ;
  (* Crawl the dependency graph from a starting vertex, accumulate the context
    rules, and chop edges targeting them. *)
  let rec chop_contexts ?(acc = []) graph from =
    let acc = acc @ Rule_graph.succ cont_graph from in
    List.iter acc ~f:(fun target -> Rule_graph.remove_edge graph from target) ;
    (* filter out self references *)
    Rule_graph.succ graph from
    |> List.filter ~f:(fun to_ -> Rule_name.equal from to_ |> not)
    |> List.iter ~f:(chop_contexts ~acc graph)
  in
  let transitive_dependencies from =
    let graph = Rule_graph.copy dep_graph in
    chop_contexts graph from ;
    Oper.transitive_closure ~reflexive:false graph
  in
  (* Extracts the parameters (rules without values) that a given rule depends on.

      @param rule_name The name of the rule to extract parameters for
      @return A tuple containing the rule name and its list of parameter dependencies *)
  let extract_parameters rule_name =
    let transitive_dependencies = transitive_dependencies rule_name in
    let successor_rules = G.succ transitive_dependencies rule_name in
    let parameter_rules =
      List.filter successor_rules ~f:(fun dependent_rule_name ->
          let rule_definition =
            List.find_exn
              ~f:(fun rule ->
                Rule_name.equal (Pos.value rule.name) dependent_rule_name )
              ast
          in
          not (Shared_ast.has_value rule_definition) )
    in
    (rule_name, remove_duplicates parameter_rules)
  in
  let wrap_meta ~is_output (rule_name, parameters) =
    { rule_name
    ; parameters
    ; typ= (Eval_tree.get_meta eval_tree rule_name).typ
    ; meta= (Shared_ast.find rule_name ast).meta
    ; is_output }
  in
  (* Extract the parameter list for each output rule *)
  let output_parameters =
    List.filter_map ast ~f:(fun rule_def ->
        let rule_name = Pos.value rule_def.name in
        if
          Shared_ast.has_public_tag rule_def
          && Module_id.is_root (Shared_ast.get_module_id_exn rule_def)
        then Some (extract_parameters rule_name)
        else None )
  in
  let outputs = List.map ~f:(wrap_meta ~is_output:true) output_parameters in
  let parameters =
    let dedup = remove_duplicates @@ List.concat_map ~f:snd output_parameters in
    List.map ~f:extract_parameters dedup
    |> List.map ~f:(wrap_meta ~is_output:false)
  in
  let rules = parameters @ outputs in
  (* Generate warnings for missing type information *)
  let warnings =
    List.filter_map rules ~f:(fun {rule_name; typ; _} ->
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
                 ~hints:
                   ["Spécifiez l'unité de la règle. Par exemple : `unité: €`"]
                 message )
        | Some _ ->
            None )
  in
  if warn_types then return ~logs:warnings rules else return outputs
