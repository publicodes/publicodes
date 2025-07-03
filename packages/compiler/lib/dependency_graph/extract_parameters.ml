open Core
open Shared
open Shared.Shared_ast
open Utils
open Rule_graph
open Utils.Output
module Oper = Graph.Oper.I (G)
module Traverse = Graph.Traverse.Dfs (G)

let remove_duplicates (a : 'a list) : 'a list =
  Set.to_list @@ Set.Poly.of_list a

(* TODO : add inputs in parameters, add type, and log if a param is missing  type info  *)
let extract_parameters ~(ast : 'a Shared_ast.t) ~(tree : Hashed_tree.t)
    (graph : G.t) =
  let transitive_dependencies =
    Oper.transitive_closure ~reflexive:false graph
  in
  (* Add self-dependencies for rules without value *)
  List.iter ast ~f:(fun rule_def ->
      let rule_name = Pos.value rule_def.name in
      if not (Shared_ast.has_value rule_def) then
        G.add_edge transitive_dependencies rule_name rule_name ) ;
  let extract_parameters rule_name =
    let successor_rules = G.succ transitive_dependencies rule_name in
    let parameter_rules =
      List.filter successor_rules ~f:(fun dependent_rule_name ->
          let rule_definition =
            List.find_exn
              ~f:(fun rule ->
                [%compare.equal: Rule_name.t] (Pos.value rule.name)
                  dependent_rule_name )
              ast
          in
          not (Shared_ast.has_value rule_definition) )
    in
    (rule_name, remove_duplicates parameter_rules)
  in
  let outputs_with_params =
    List.filter_map ast ~f:(fun rule_def ->
        let rule_name = Pos.value rule_def.name in
        if Shared_ast.has_public_tag rule_def then
          Some (extract_parameters rule_name)
        else None )
  in
  (* We get the parameter list *)
  let parameters =
    remove_duplicates @@ List.concat_map ~f:snd outputs_with_params
  in
  let outputs =
    remove_duplicates
      ( outputs_with_params
      @
      (* We add the parameters of the parameters *)
      List.map parameters ~f:extract_parameters )
  in
  (* We print warning if an output is without type *)
  let warnings =
    List.filter_map outputs ~f:(fun (rule_name, _) ->
        let typ = (Eval_tree.get_meta tree rule_name).typ in
        match typ with
        | None ->
            let code, message = Err.missing_output_type in
            let pos = Eval_tree.get_pos tree rule_name in
            Some
              (Log.warning ~code ~pos ~kind:`Type
                 ~hints:
                   [ "Spécifiez le type de la règle. Par exemple : `type: texte`"
                   ; Format.asprintf "%a" Rule_name.pp rule_name ]
                 message )
        | Some (Number None) ->
            let code, message = Err.missing_output_type in
            let pos = Eval_tree.get_pos tree rule_name in
            Some
              (Log.warning ~code ~pos ~kind:`Type
                 ~hints:
                   ["Spécifiez l'unité de la règle. Par exemple : `unité: €`"]
                 message )
        | Some _ ->
            None )
  in
  return ~logs:warnings outputs
