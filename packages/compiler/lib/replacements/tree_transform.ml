open Shared
open Shared.Eval_tree
open Utils
open Base
open Utils.Output
open Replacements_types
open Replacements_graph

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
    find_replacements ~rule:reference graph
    (* Filter replacements based on only_in and except_in *)
    |> List.filter ~f:(is_replacement_eligible ~rule)
  in
  (* Check for exclusive replacements *)
  let logs = check_exclusive_duplicates ~pos replacements in
  (List.map replacements ~f:fst, logs)

let find_eligible_make_not_applicable ~rule ~reference replacements =
  find_replacements ~rule:reference replacements
  (* Filter replacements based on only_in and except_in *)
  |> List.filter ~f:(is_replacement_eligible ~rule)
  |> List.map ~f:fst

(* TODO: is it really necessary to have mk as parameter here? *)
let create_make_not_applicable_node ~mk ~pos ~condition_node ~node =
  let p = mk ~pos in
  (* if (condition_node = null || is_not_defined condition_node || condition_node = false)
        then node else null *)
  Eval_tree.(
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

let create_replace_node ~mk ~pos ~replacing_node ~node =
  let p = mk ~pos in
  (* if replacement != null then replacement else node *)
  Eval_tree.(
    p
      (mk_condition
         ~cond:(p (binop_neq ~pos replacing_node (p const_not_applicable)))
         ~then_:replacing_node ~else_:node ) )

let create_exclusive_replacement_node ~mk ~pos ~replacement_list ~node =
  let p = mk ~pos in
  Eval_tree.(
    p (mk_exclusive_replacement ~target:node ~replacements:replacement_list) )

(* Apply rule replacements to a tree *)
let apply_replacements ~(replacements : t) ~(mk : 'a mk_value_fn)
    (tree : 'a Eval_tree.t) : 'a Eval_tree.t Output.t =
  let logs = ref [] in
  (* Apply rule replacements to an evaluation tree *)
  let rec apply_to_node ~(rule : Rule_name.t) (node : 'a Eval_tree.value) :
      'a Eval_tree.value =
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
              let replacing_node = apply_to_node ~rule (mk ~pos (Ref hd)) in
              create_replace_node ~mk ~pos ~replacing_node ~node
          | _ ->
              create_exclusive_replacement_node ~mk ~pos ~replacement_list
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
                apply_to_node ~rule (mk ~pos (Ref condition_rule))
              in
              create_make_not_applicable_node ~mk ~pos ~condition_node
                ~node:node_acc )
        in
        node
    | _ ->
        node
  in
  let updated_tree =
    Hashtbl.mapi tree ~f:(fun ~key:rule ~data:value ->
        Eval_tree.map_value value ~f:(apply_to_node ~rule) )
  in
  return ~logs:!logs updated_tree
