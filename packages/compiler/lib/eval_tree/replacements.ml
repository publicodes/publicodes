open Base
open Shared

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

(* Apply rule replacements to a tree. The replacement tree of each reference
   site is resolved once by [Replacement_graph.resolve_*]; here we only map it
   to evaluation nodes. *)
let transform ~(replacement_graph : Replacement_graph.Rule_graph.t)
    ~(make_not_applicable_graph : Replacement_graph.Rule_graph.t) rule value =
  let module RG = Replacement_graph in
  let rec expand ~(rule : Rule_name.t) ~pos ~meta (r : RG.inlined_ref) :
      'a option Tree.value =
    apply ~rule ~pos ~meta ~target:r.rule r
      (Tree.mk_value ~pos ~meta (Ref r.rule))
  and apply ~(rule : Rule_name.t) ~pos ~meta ~target (inlined : RG.inlined_ref)
      (node : 'a option Tree.value) : 'a option Tree.value =
    let node =
      match inlined.replaced_by with
      | [] ->
          node
      | [r] ->
          create_replace_node ~pos ~meta
            ~replacing_node:(expand ~rule ~pos ~meta r)
            ~node
      | _ ->
          create_exclusive_replacement_node ~pos ~meta
            ~replacement_list:(List.map inlined.replaced_by ~f:(fun r -> r.rule))
            ~node:target
    in
    List.fold inlined.made_not_applicable_by ~init:node ~f:(fun node_acc r ->
        create_make_not_applicable_node ~pos ~meta
          ~condition_node:(expand ~rule ~pos ~meta r)
          ~node:node_acc )
  in
  let apply_to_node (node : 'a option Tree.value) : 'a option Tree.value =
    let pos = node.pos in
    let meta = node.meta in
    match node.value with
    | Ref reference ->
        let inlined =
          RG.resolve ~from:rule ~replacement_graph ~make_not_applicable_graph
            ~rule:reference
        in
        apply ~rule ~pos ~meta ~target:reference inlined node
    | _ ->
        node
  in
  Tree.map_value value ~f:apply_to_node
