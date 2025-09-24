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

(** Extracts the public outputs of a model from its AST and dependency graph.

    This function identifies all rules marked as public in the AST and computes their
    dependencies (parameters). It also adds metadata and type information to each output.

    @param ast The abstract syntax tree of the model
    @param eval_tree The evaluation tree containing metadata and positions
    @param graph The dependency graph of the model
    @return A list of model outputs with their metadata and dependencies, wrapped in an Output.t *)
let extract_outputs ~(ast : 'a Shared_ast.t) ~(eval_tree : Hashed_tree.t)
    (graph : G.t) : Model_outputs.t Output.t =
  let transitive_dependencies =
    Oper.transitive_closure ~reflexive:false graph
  in
  (* Add self-dependencies for rules without value *)
  List.iter ast ~f:(fun rule_def ->
      let rule_name = Pos.value rule_def.name in
      if not (Shared_ast.has_value rule_def) then
        G.add_edge transitive_dependencies rule_name rule_name ) ;
  (** Extracts the parameters (rules without values) that a given rule depends on.

      @param rule_name The name of the rule to extract parameters for
      @return A tuple containing the rule name and its list of parameter dependencies *)
  let extract_parameters rule_name =
    let successor_rules = G.succ transitive_dependencies rule_name in
    let parameter_rules =
      List.filter successor_rules ~f:(fun dependent_rule_name ->
          let rule_definition =
            List.find_exn
              ~f:(fun rule ->
                Rule_name.equal (Pos.value rule.name)
                  dependent_rule_name )
              ast
          in
          not (Shared_ast.has_value rule_definition) )
    in
    (rule_name, remove_duplicates parameter_rules)
  in
  (* Extract the parameter list for each output rule *)
  let outputs =
    List.filter_map ast ~f:(fun rule_def ->
        let rule_name = Pos.value rule_def.name in
        if Shared_ast.has_public_tag rule_def then
          Some (extract_parameters rule_name)
        else None )
  in
  (* Parameters are also outputs of the model as they can be evaluated independently *)
  let parameters =
    remove_duplicates @@ List.concat_map ~f:snd outputs
  in
  let outputs =
    remove_duplicates
      ( outputs
      @
      List.map parameters ~f:extract_parameters )
  in
  (* Add metadata to outputs *)
  let outputs: t = List.map ~f:(fun (rule_name, parameters) -> {
    rule_name;
    parameters;
    typ= (Eval_tree.get_meta eval_tree rule_name).typ;
    meta= (Shared_ast.find rule_name ast).meta;
  }) outputs
  in

  (* Generate warnings for outputs missing type information *)
  let warnings =
    List.filter_map outputs ~f:(fun ({rule_name; typ; _}) ->
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
  return ~logs:warnings outputs
