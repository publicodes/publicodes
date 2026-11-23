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

let create_make_applicable_node ~pos ~meta ~condition_node ~node =
  let p = Tree.mk_value ~pos ~meta in
  (* if (is_not_applicable condition_node || is_not_defined condition_node || condition_node = false)
        then not_applicable else node *)
  Tree.(
    p
      (mk_condition
         ~cond:
           (p
              (binop_or ~pos
                 (p (unop_is_not_applicable ~pos condition_node))
                 (p
                    (binop_or ~pos
                       (p (unop_is_not_defined ~pos condition_node))
                       (p (binop_eq ~pos condition_node (p const_false))) ) ) ) )
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
  let node =
    List.fold inlined.made_not_applicable_by ~init:node ~f:(fun node_acc r ->
        create_make_not_applicable_node ~pos ~meta
          ~condition_node:(expand ~pos ~meta r) ~node:node_acc )
  in
  List.fold inlined.made_applicable_by ~init:node ~f:(fun node_acc r ->
      create_make_applicable_node ~pos ~meta
        ~condition_node:(expand ~pos ~meta r) ~node:node_acc )

and expand ~pos ~meta (r : Shared_ast.inlined_ref) : 'a option Tree.value =
  inline_ref ~pos ~meta r (Tree.mk_value ~pos ~meta (Ref r.rule))
