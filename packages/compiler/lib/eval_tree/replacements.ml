open Base
open Shared
open Utils

let find_eligible_make_not_applicable ~rule ~reference make_not_applicable =
  Replacement_graph.find_transitive_replacements ~from:rule ~rule:reference
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

let create_applicable_on_namespace_node ~pos ~meta ~parent_rule ~node =
  let p = Tree.mk_value ~pos ~meta in
  (* if (is_not_applicable parent_rule || is_not_defined parent_rule || parent_rule = false)
        then not_applicable else node *)
  Tree.(
    p
      (mk_condition
         ~cond:
           (p
              (binop_or ~pos
                 (p (unop_is_not_applicable ~pos parent_rule))
                 (p
                    (binop_or ~pos
                       (p (unop_is_not_defined ~pos parent_rule))
                       (p (binop_eq ~pos parent_rule (p const_false))) ) ) ) )
         ~then_:(p const_not_applicable) ~else_:node ) )

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

let rec inline_ref ~pos ~meta (inlined : Shared_ast.inlined_ref)
    (node : 'a option Tree.value) : 'a option Tree.value =
  let node =
    match inlined.replaced_by with
    | [] ->
        node
    | [r] ->
        create_replace_node ~pos ~meta ~replacing_node:(expand ~pos ~meta r)
          ~node
    | _ ->
        create_exclusive_replacement_node ~pos ~meta
          ~replacement_list:(List.map inlined.replaced_by ~f:(fun r -> r.rule))
          ~node:inlined.rule
  in
  List.fold inlined.made_not_applicable_by ~init:node ~f:(fun node_acc r ->
      create_make_not_applicable_node ~pos ~meta
        ~condition_node:(expand ~pos ~meta r) ~node:node_acc )

and expand ~pos ~meta (r : Shared_ast.inlined_ref) : 'a option Tree.value =
  inline_ref ~pos ~meta r (Tree.mk_value ~pos ~meta (Ref r.rule))

let transform_extended_parent_applicability ~make_not_applicable_graph ~meta
    ~pos ast rule value =
  let parents_applicable_on_namespace =
    Shared_ast.parents_applicable_on_namespace ast rule
    |> List.map ~f:(fun (rule_def : Shared_ast.typed_rule_def) ->
        Mark.remove rule_def.name )
  in
  (* Use them all to correctly list eligible make_not_applicable, even
       if this cause multiple checks *)
  List.fold parents_applicable_on_namespace ~init:value
    ~f:(fun node_acc parent ->
      let parent_rule =
        let make_not_applicable_list =
          find_eligible_make_not_applicable ~rule ~reference:parent
            make_not_applicable_graph
        in
        let init = Tree.mk_value ~meta ~pos (Ref parent) in
        List.fold make_not_applicable_list ~init
          ~f:(fun node_acc condition_rule ->
            (* Apply make not applicable recursively (to handle transitivity) *)
            let condition_node =
              Tree.mk_value ~meta ~pos (Ref condition_rule)
            in
            create_make_not_applicable_node ~pos ~meta ~condition_node
              ~node:node_acc )
      in
      create_applicable_on_namespace_node ~pos ~meta ~parent_rule ~node:node_acc )

(* A child is applicable only where its namespace parent is. *)
let transform ~(make_not_applicable_graph : Replacement_graph.Rule_graph.t) ast
    rule value =
  Tree.map_value value ~f:(fun node ->
      transform_extended_parent_applicability ~make_not_applicable_graph
        ~meta:node.meta ~pos:node.pos ast rule node )
