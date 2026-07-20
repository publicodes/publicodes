open Base
open Shared
open Shared_ast
open Utils
open Output
open Replacements_graph

type t =
  { replace: Replacements_graph.Graph.t
  ; make_not_applicable: Replacements_graph.Graph.t }

let from_resolved_ast ast =
  let* replacement_graph =
    ast
    |> Replacements_graph.build_graph ~get_replacement_rules:(fun rule ->
        rule.replace )
    |> Replacements_graph.detect_cycles
  in
  let* make_not_applicable_graph =
    ast
    |> Replacements_graph.build_graph ~get_replacement_rules:(fun rule ->
        rule.make_not_applicable )
    |> Replacements_graph.detect_cycles
  in
  return
    {replace= replacement_graph; make_not_applicable= make_not_applicable_graph}

let check_exclusive_duplicates ~pos replacements =
  if List.length replacements <= 1 then []
  else
    let duplicates = List.map replacements ~f:snd in
    (* Check for true exclusive attribute for each duplicate *)
    let duplicates_without_exclusive_attr =
      List.filter duplicates ~f:(fun duplicate ->
          not (Pos.value duplicate).exclusive )
    in
    if List.is_empty duplicates_without_exclusive_attr then []
    else
      let labels =
        List.map duplicates_without_exclusive_attr ~f:(fun (_, pos) ->
            Pos.mk ~pos "ici" )
      in
      let code, message = Err.replace_multiple in
      let error =
        Log.error ~pos ~kind:`Replace
          ~hints:
            [ "Plusieurs remplacements pour la même règle détectés."
            ; "Utilisez des « remplace » chainés s'il est question de priorité \
               métier ou ajoutez un attribut « exclusif: oui »" ]
          ~code ~labels message
      in
      [error]

(* Find all eligible replacements for a rule reference *)
let find_eligible_replacements ~pos ~rule ~reference graph =
  let replacements =
    Replacements_graph.find_replacements ~rule:reference graph
    (* Filter replacements based on only_in and except_in *)
    |> List.filter ~f:(is_replacement_eligible ~rule)
  in
  (* Check for exclusive replacements *)
  let logs = check_exclusive_duplicates ~pos replacements in
  (List.map replacements ~f:fst, logs)

let find_eligible_make_not_applicable ~rule ~reference replacements =
  Replacements_graph.find_replacements ~rule:reference replacements
  (* Filter replacements based on only_in and except_in *)
  |> List.filter ~f:(is_replacement_eligible ~rule)
  |> List.map ~f:fst

(* TODO: is it really necessary to have mk as parameter here? *)
let create_make_not_applicable_node ~pos ~condition_node ~node =
  let p = Tree.mk_value ~pos in
  (* if (condition_node = null || is_not_defined condition_node || condition_node = false)
        then node else null *)
  Tree.(
    p
      (mk_condition
         ~cond:
           (p
              (binop_or ~pos
                 (p (binop_eq ~pos condition_node (p const_not_applicable)))
                 (p
                    (binop_or ~pos
                       (p (unop_is_not_defined ~pos condition_node))
                       (p (binop_eq ~pos condition_node (p const_false))) ) ) ) )
         ~then_:node ~else_:(p const_not_applicable) ) )

let create_replace_node ~pos ~replacing_node ~node =
  let p = Tree.mk_value ~pos in
  (* if replacement != null then replacement else node *)
  Tree.(
    p
      (mk_condition
         ~cond:(p (binop_neq ~pos replacing_node (p const_not_applicable)))
         ~then_:replacing_node ~else_:node ) )

let create_exclusive_replacement_node ~pos ~replacement_list ~node =
  let p = Tree.mk_value ~pos in
  Tree.(p (mk_exclusive_replacement ~target:node ~replacements:replacement_list))

(* Apply rule replacements to a tree *)
let transform ~(replacements : t) rule value =
  let logs = ref [] in
  (* Apply rule replacements to an evaluation tree *)
  let rec apply_to_node ~(rule : Rule_name.t) (node : 'a Tree.value) :
      'a Tree.value =
    let pos = node.pos in
    match node.value with
    | Ref reference ->
        let replacement_list, log =
          find_eligible_replacements ~pos ~rule ~reference replacements.replace
        in
        logs := log @ !logs ;
        let node =
          match replacement_list with
          | [] ->
              node
          | [hd] ->
              let replacing_node =
                apply_to_node ~rule (Tree.mk_value ~pos (Ref hd))
              in
              create_replace_node ~pos ~replacing_node ~node
          | _ ->
              create_exclusive_replacement_node ~pos ~replacement_list
                ~node:reference
        in
        let make_not_applicable_list =
          find_eligible_make_not_applicable ~rule ~reference
            replacements.make_not_applicable
        in
        let node =
          List.fold make_not_applicable_list ~init:node
            ~f:(fun node_acc condition_rule ->
              (* Apply make not applicable recursively (to handle transitivity) *)
              let condition_node =
                apply_to_node ~rule (Tree.mk_value ~pos (Ref condition_rule))
              in
              create_make_not_applicable_node ~pos ~condition_node
                ~node:node_acc )
        in
        node
    | _ ->
        node
  in
  let updated_tree = Tree.map_value value ~f:(apply_to_node ~rule) in
  return ~logs:!logs updated_tree
