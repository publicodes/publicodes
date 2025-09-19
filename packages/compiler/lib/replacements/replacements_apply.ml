open Shared
open Shared.Eval_tree
open Shared.Shared_ast
open Utils
open Core
open Utils.Output
open Replacements_types
open Replacements_graph

let check_priority_duplicates ~pos replacements =
  let meta_list = List.map replacements ~f:snd in
  let duplicates =
    List.find_all_dups meta_list ~compare:ReplacementEdge.compare
  in
  let duplicates =
    List.filter
      ~f:(fun replacement ->
        List.mem ~equal:ReplacementEdge.equal duplicates replacement )
      (List.map ~f:snd replacements)
  in
  if List.is_empty duplicates then []
  else
    let labels =
      List.map duplicates ~f:(fun meta ->
          Pos.map meta ~f:(fun r -> Format.asprintf "Priorité %d" r.priority) )
    in
    let code, message = Err.replace_multiple in
    let error =
      Log.error ~pos ~kind:`Replace
        ~hints:
          [ "plusieurs remplacement avec la même priorité détecté"
          ; "modifier la priorité avec : \n\
             remplace: \n\
            \    références à: ... \n\
            \    priorité: <nombre>" ]
        ~code ~labels message
    in
    [error]

(** Find all applicable replacements for a rule reference *)
let find_applicable_replacements ~pos ~rule ~reference graph =
  let replacements =
    find_replacements ~rule:reference graph
    (* Filter replacements based on only_in and except_in *)
    |> List.filter ~f:(fun (_, meta) -> is_replacement_applicable ~rule ~meta)
  in
  (* Check for replacements with duplicate priorities *)
  let logs = check_priority_duplicates ~pos replacements in
  (* Sort by priority (highest first), then alphabetically *)
  let sorted_replacements =
    List.sort replacements ~compare:(fun (rule_a, meta_a) (rule_b, meta_b) ->
        (* First: priority *)
        let priority_comparison = ReplacementEdge.compare meta_a meta_b in
        if priority_comparison = 0 then
          (* Second: alphabetical *)
          Rule_name.compare rule_a rule_b
        else priority_comparison )
  in
  (List.map sorted_replacements ~f:fst, logs)

(** Apply rule replacements to a tree *)
let apply_replacements ~(replacements : t) ~(mk : 'a mk_value_fn)
    (tree : 'a Eval_tree.t) : 'a Eval_tree.t Output.t =
  let logs = ref [] in
  (* Apply rule replacements to an evaluation tree *)
  let rec apply_replacement_to_node ~(rule : Rule_name.t)
      (node : 'a Eval_tree.value) : 'a Eval_tree.value =
    let pos = node.pos in
    match node.value with
    | Ref reference ->
        let replacements, log =
          find_applicable_replacements ~pos ~rule ~reference replacements
        in
        logs := log @ !logs ;
        let result_node =
          List.fold replacements ~init:node ~f:(fun acc replacement ->
              let p = mk ~pos in
              (* Apply replacements recursively to the replacing node *)
              let replacing_node =
                apply_replacement_to_node ~rule (p (Ref replacement))
              in
              (* if replacement != null then replacement else node *)
              p
                (Condition
                   ( p
                       (Binary_op
                          ( Pos.mk ~pos:node.pos NotEq
                          , replacing_node
                          , p (Const Null) ) )
                   , replacing_node
                   , acc ) ) )
        in
        result_node
    | _ ->
        node
  in
  let updated_tree =
    Hashtbl.mapi tree ~f:(fun ~key:rule ~data:value ->
        Eval_tree.map value ~f:(apply_replacement_to_node ~rule) )
  in
  return ~logs:!logs updated_tree
