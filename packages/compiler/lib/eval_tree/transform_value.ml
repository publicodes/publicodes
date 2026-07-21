open Base
open Utils
open Shared
open Tree

(* Helper function to convert between the two constant types *)
let convert_constant expr_const =
  match expr_const with
  | Shared_ast.Number (n, unit) ->
      Tree.Number (n, unit)
  | Bool b ->
      Bool b
  | String s ->
      String s
  | Symbol s ->
      Symbol s
  | Date d ->
      Date d

let rec transform ?(undefined = Tree.const_not_defined)
    (value : Shared_ast.typed_value) : Typ.t Tree.value =
  let node, _ = value in
  let node_value, Shared_ast.{pos; typ} = node.value in
  let value =
    match node_value with
    | Not_defined ->
        (* FIXME: should be an NotDefined type *)
        Tree.mk_value ~meta:typ ~pos undefined
    | _ ->
        transform_mechanism_value node.value
  in
  unfold_chainable_mechanism ~init:value node.chainable_mechanisms

and transform_expr
    ((expr, {pos; typ}) :
      (Shared.Rule_name.t, Shared_ast.typed_mark) Shared_ast.expr ) =
  let mk_value = Tree.mk_value ~meta:typ ~pos in
  match expr with
  | Const value ->
      mk_value (Const (convert_constant value))
  | Binary_op (op, left, right) ->
      mk_value (Binary_op (op, transform_expr left, transform_expr right))
  | Unary_op ((Neg, {pos}), expr) ->
      mk_value (Unary_op (Mark.mk_pos ~pos Tree.Neg, transform_expr expr))
  | Ref name ->
      mk_value (Ref name)

and transform_mechanism_value
    ((node, {pos; typ}) :
      ( (Shared.Rule_name.t, Shared_ast.typed_mark) Shared_ast.value_mechanism
      , Shared_ast.typed_mark )
      Mark.ed ) =
  match node with
  | Not_defined ->
      Tree.mk_value ~pos ~meta:typ (Const Not_defined)
  | Expr expr ->
      transform_expr expr
  | Sum sum ->
      transform_sum ~pos sum
  | Product product ->
      transform_product ~pos product
  | One_of any_of ->
      transform_any_of ~pos any_of
  | All_of all_of ->
      transform_all_of ~pos all_of
  | Min_of all_of ->
      transform_min_of ~pos all_of
  | Max_of all_of ->
      transform_max_of ~pos all_of
  | Value value ->
      transform value
  | Variations variations ->
      transform_variations ~pos variations
  | Is_applicable value ->
      transform_is_applicable ~pos value
  | Is_not_applicable value ->
      transform_is_not_applicable ~pos value

and unfold_chainable_mechanism ~init mechanisms =
  mechanisms
  |> List.sort ~compare:(fun (a, _) (b, _) ->
      Shared_ast.compare_chainable_mechanism Shared.Rule_name.compare
        Shared_ast.compare_typed_mark a b )
  |> List.fold_right ~init
       ~f:(fun
           ((mec, {pos; _}) : (_, Shared_ast.typed_mark) Mark.ed)
           (acc : Typ.t value)
         ->
         match mec with
         | Shared_ast.Type _ ->
             acc
         | Applicable_if applicable_if ->
             transform_applicable_if ~pos applicable_if acc
         | Not_applicable_if not_applicable_if ->
             transform_not_applicable_if ~pos not_applicable_if acc
         | Ceiling ceiling ->
             transform_ceiling ~pos ceiling acc
         | Floor floor ->
             transform_floor ~pos floor acc
         | Context context ->
             transform_context ~pos context acc
         | Default default ->
             transform_default ~pos default acc
         | Round round ->
             transform_round ~pos round acc )

(* TODO: a lot of factorisation possible here! *)
and transform_sum ~pos nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:Typ.TBool ~pos Tree.const_not_applicable
  | n :: nodes ->
      let value = transform n in
      List.fold_right nodes ~init:value ~f:(fun node acc ->
          let Shared_ast.{typ; _} = Mark.get node in
          Tree.mk_value ~pos ~meta:typ
            (Tree.binop_add ~pos (transform node) acc) )

and transform_product ~pos nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:Typ.TBool ~pos Tree.const_not_applicable
  | n :: nodes ->
      let value = transform n in
      List.fold_right nodes ~init:value ~f:(fun node acc ->
          let Shared_ast.{typ; _} = Mark.get node in
          Tree.mk_value ~pos ~meta:typ
            (Tree.binop_mul ~pos (transform node) acc) )

and transform_any_of ~pos nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:Typ.TBool ~pos Tree.const_not_applicable
  | nodes ->
      let init =
        Tree.mk_value ~pos
          ~meta:(Typ.Literal (Mark.mk_pos ~pos Typ.(LBool false)))
          Tree.const_false
      in
      List.fold_right nodes ~init ~f:(fun node acc ->
          let Shared_ast.{typ; _} = Mark.get node in
          Tree.mk_value ~pos ~meta:typ (Tree.binop_or ~pos (transform node) acc) )

and transform_all_of ~pos nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:Typ.TBool ~pos Tree.const_not_applicable
  | nodes ->
      let init =
        Tree.mk_value ~pos
          ~meta:(Typ.Literal (Mark.mk_pos ~pos Typ.(LBool true)))
          Tree.const_true
      in
      List.fold_right nodes ~init ~f:(fun node acc ->
          let Shared_ast.{typ; _} = Mark.get node in
          Tree.mk_value ~pos ~meta:typ
            (Tree.binop_and ~pos (transform node) acc) )

and transform_max_of ~pos nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:Typ.TBool ~pos Tree.const_not_applicable
  | n :: nodes ->
      let value = transform n in
      List.fold_right nodes ~init:value ~f:(fun node acc ->
          let Shared_ast.{typ; _} = Mark.get node in
          Tree.mk_value ~pos ~meta:typ
            (Tree.binop_max ~pos (transform node) acc) )

and transform_min_of ~pos nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:Typ.TBool ~pos Tree.const_not_applicable
  | n :: nodes ->
      let value = transform n in
      List.fold_right nodes ~init:value ~f:(fun node acc ->
          let Shared_ast.{typ; _} = Mark.get node in
          Tree.mk_value ~pos ~meta:typ
            (Tree.binop_min ~pos (transform node) acc) )

and transform_applicable_if ~pos condition value =
  let Shared_ast.{typ; _} = Mark.get condition in
  (* FIXME: each node probably need it's own type, not just the condition *)
  let p = Tree.mk_value ~pos ~meta:typ in
  let condition = transform condition in
  Tree.(
    p
      (mk_condition
         ~cond:
           (p
              (binop_or ~pos
                 (p (unop_is_not_defined ~pos condition))
                 (p
                    (binop_or ~pos
                       (p (binop_eq ~pos condition (p const_false)))
                       (p (binop_eq ~pos condition (p const_not_applicable))) ) ) ) )
         ~then_:(p const_not_applicable) ~else_:value ) )

and transform_not_applicable_if ~pos condition value =
  let Shared_ast.{typ; _} = Mark.get condition in
  (* FIXME: each node probably need it's own type, not just the condition *)
  let p = Tree.mk_value ~pos ~meta:typ in
  let condition = transform condition in
  Tree.(
    p
      (mk_condition
         ~cond:
           (p
              (binop_or ~pos
                 (p (unop_is_not_defined ~pos condition))
                 (p
                    (binop_or ~pos
                       (p (binop_eq ~pos condition (p const_false)))
                       (p (binop_eq ~pos condition (p const_not_applicable))) ) ) ) )
         ~then_:value ~else_:(p const_not_applicable) ) )

and transform_floor ~pos floor value =
  let Shared_ast.{typ; _} = Mark.get floor in
  (* FIXME: each node probably need it's own type, not just the condition *)
  let p = Tree.mk_value ~pos ~meta:typ in
  (* TODO : structural sharing *)
  let floor = transform floor in
  Tree.(
    p
      (mk_condition
         ~cond:
           (p
              (binop_and ~pos
                 (p (binop_neq ~pos floor (p const_not_applicable)))
                 (p (binop_lt ~pos value floor)) ) )
         ~then_:floor ~else_:value ) )

and transform_ceiling ~pos ceil value =
  let Shared_ast.{typ; _} = Mark.get ceil in
  (* FIXME: each node probably need it's own type, not just the condition *)
  let p = Tree.mk_value ~pos ~meta:typ in
  (* TODO : structural sharing *)
  let ceil = transform ceil in
  Tree.(
    p
      (mk_condition
         ~cond:
           (p
              (binop_and ~pos
                 (p (binop_neq ~pos ceil (p const_not_applicable)))
                 (p (binop_gt ~pos value ceil)) ) )
         ~then_:ceil ~else_:value ) )

and transform_context ~pos context value =
  (* FIXME: add a type for context values *)
  Tree.mk_value ~pos ~meta:Typ.TBool
    (Set_context
       { context=
           List.map context ~f:(fun (rule_name, value) ->
               (rule_name, transform value) )
       ; value } )

and transform_default ~pos default value =
  let Shared_ast.{typ; _} = Mark.get default in
  let p = Tree.mk_value ~pos ~meta:typ in
  Tree.(
    p
      (mk_condition
         ~cond:(p (unop_is_not_defined ~pos value))
         ~then_:(transform default) ~else_:value ) )

and transform_variations ~pos (variations, else_) =
  let Shared_ast.{typ; _} = Mark.get (List.hd_exn variations).if_ in
  let p = Tree.mk_value ~pos ~meta:typ in
  let else_ =
    match else_ with
    | None ->
        p Tree.const_not_applicable
    | Some else_ ->
        transform else_
  in
  List.fold_right variations ~init:else_ ~f:(fun {if_; then_} else_ ->
      let if_ = transform if_ in
      let then_ = transform then_ in
      Tree.(
        p
          (mk_condition
             ~cond:(p (binop_eq ~pos if_ (p const_true)))
             ~then_ ~else_ ) ) )

and transform_is_not_applicable ~pos value =
  let p = Tree.mk_value ~pos ~meta:Typ.TBool in
  let value = transform value in
  Tree.(p (binop_eq ~pos value (p const_not_applicable)))

and transform_is_applicable ~pos value =
  let p = Tree.mk_value ~pos ~meta:Typ.TBool in
  let value = transform value in
  Tree.(p (binop_neq ~pos value (p const_not_applicable)))

and transform_round ~pos round value =
  let Shared_ast.{typ; _} = Mark.get (snd round) in
  let p = Tree.mk_value ~pos ~meta:typ in
  let rounding, precision = round in
  p (Round (rounding, transform precision, value))
