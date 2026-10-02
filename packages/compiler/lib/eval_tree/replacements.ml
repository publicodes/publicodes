open Base
open Shared

(* Find all eligible replacements for a rule reference *)
let find_eligible_replacements ~rule ~reference graph =
  Replacement_graph.find_replacements ~from:rule ~rule:reference graph
  |> List.map ~f:fst

let find_eligible_make_not_applicable ~rule ~reference make_not_applicable =
  Replacement_graph.find_replacements ~from:rule ~rule:reference
    make_not_applicable
  |> List.map ~f:fst

let create_make_not_applicable_node ~pos ~meta ~condition_node ~node =
  let p = Tree.mk_value ~pos ~meta in
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

let create_replace_node ~pos ~meta ~replacing_node ~node =
  let p = Tree.mk_value ~pos ~meta in
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
let transform ~(replacement_graph : Replacement_graph.Rule_graph.t)
    ~(make_not_applicable_graph : Replacement_graph.Rule_graph.t) rule value =
  (* Apply rule replacements to an evaluation tree *)
  let rec apply_to_node ~(rule : Rule_name.t) (node : 'a option Tree.value) :
      'a option Tree.value =
    let pos = node.pos in
    let meta = node.meta in
    match node.value with
    | Ref reference ->
        let replacement_list =
          find_eligible_replacements ~rule ~reference replacement_graph
        in
        let node =
          match replacement_list with
          | [] ->
              node
          | [hd] ->
              let replacing_node =
                apply_to_node ~rule (Tree.mk_value ~pos ~meta (Ref hd))
              in
              create_replace_node ~pos ~meta ~replacing_node ~node
          | _ ->
              create_exclusive_replacement_node ~pos ~meta ~replacement_list
                ~node:reference
        in
        let make_not_applicable_list =
          find_eligible_make_not_applicable ~rule ~reference
            make_not_applicable_graph
        in
        let node =
          List.fold make_not_applicable_list ~init:node
            ~f:(fun node_acc condition_rule ->
              (* Apply make not applicable recursively (to handle transitivity) *)
              let condition_node =
                apply_to_node ~rule
                  (Tree.mk_value ~meta ~pos (Ref condition_rule))
              in
              create_make_not_applicable_node ~pos ~meta ~condition_node
                ~node:node_acc )
        in
        node
    | _ ->
        node
  in
  Tree.map_value value ~f:(apply_to_node ~rule)
