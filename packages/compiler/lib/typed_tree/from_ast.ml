open Base
open Utils
open Tree
module Shared_ast = Shared.Shared_ast
module Eval_tree = Shared.Eval_tree

(* Helper function to convert between the two constant types *)
let convert_constant expr_const =
  match expr_const with
  | Shared_ast.Number (n, unit) ->
      Eval_tree.Number (n, unit)
  | Shared_ast.Bool b ->
      Bool b
  | Shared_ast.String s ->
      String s
  | Shared_ast.Date d ->
      Date d

let rec transform_expr (expr, pos) =
  match expr with
  | Shared_ast.Const value ->
      mk ~pos (Const (convert_constant value))
  | Shared_ast.Binary_op (op, left, right) ->
      mk ~pos (Binary_op (op, transform_expr left, transform_expr right))
  | Shared_ast.(Unary_op ((Neg, pos), expr)) ->
      mk ~pos (Unary_op (Pos.mk ~pos Eval_tree.Neg, transform_expr expr))
  | Shared_ast.Ref name ->
      mk ~pos (Ref name)

and transform_value ?(undefined = Eval_tree.const_not_defined)
    (node : 'a Shared_ast.value) =
  let value =
    match Pos.value node.value with
    | Shared_ast.Not_defined ->
        mk ~pos:(Pos.pos node.value) undefined
    | _ ->
        transform_mechanism_value node.value
  in
  unfold_chainable_mechanism ~init:value node.chainable_mechanisms

and transform_mechanism_value (node, pos) =
  match node with
  | Shared_ast.Not_defined ->
      mk ~pos (Const Not_defined)
  | Shared_ast.Expr expr ->
      transform_expr expr
  | Shared_ast.Sum sum ->
      transform_sum ~pos sum
  | Shared_ast.Product product ->
      transform_product ~pos product
  | Shared_ast.One_of any_of ->
      transform_any_of ~pos any_of
  | Shared_ast.All_of all_of ->
      transform_all_of ~pos all_of
  | Shared_ast.Min_of all_of ->
      transform_min_of ~pos all_of
  | Shared_ast.Max_of all_of ->
      transform_max_of ~pos all_of
  | Shared_ast.Value value ->
      transform_value value
  | Shared_ast.Variations variations ->
      transform_variations ~pos variations
  | Shared_ast.Is_applicable value ->
      transform_is_applicable ~pos value
  | Shared_ast.Is_not_applicable value ->
      transform_is_not_applicable ~pos value

and unfold_chainable_mechanism ~init mechanisms =
  mechanisms
  |> List.sort ~compare:(fun a b ->
      Shared_ast.compare_chainable_mechanism Shared.Rule_name.compare
        (Pos.value a) (Pos.value b) )
  |> List.fold_right ~init ~f:(fun (mec, pos) acc ->
      match mec with
      | Shared_ast.Applicable_if applicable_if ->
          transform_applicable_if ~pos applicable_if acc
      | Shared_ast.Not_applicable_if not_applicable_if ->
          transform_not_applicable_if ~pos not_applicable_if acc
      | Shared_ast.Ceiling ceiling ->
          transform_ceiling ~pos ceiling acc
      | Shared_ast.Floor floor ->
          transform_floor ~pos floor acc
      | Shared_ast.Context context ->
          transform_context ~pos context acc
      | Shared_ast.Default default ->
          transform_default ~pos default acc
      | Shared_ast.Type t ->
          transform_typ t acc
      | Shared_ast.Round round ->
          transform_round ~pos round acc )

(* TODO: a lot of factorisation possible here! *)
and transform_sum ~pos nodes =
  let typ = Typ.any_number () ~pos in
  match nodes with
  | [] ->
      mk ~pos ~typ Eval_tree.const_not_applicable
  | n :: nodes ->
      let value = transform_value n in
      let init = {value with meta= typ} in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mk ~pos (Eval_tree.binop_add ~pos (transform_value node) acc) )

and transform_product ~pos nodes =
  let typ = Typ.any_number () ~pos in
  match nodes with
  | [] ->
      mk ~pos ~typ Eval_tree.const_not_applicable
  | n :: nodes ->
      let value = transform_value n in
      let init = {value with meta= typ} in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mk ~pos (Eval_tree.binop_mul ~pos (transform_value node) acc) )

and transform_any_of ~pos nodes =
  let typ = Typ.literal ~pos Shared.Typ.Bool in
  match nodes with
  | [] ->
      mk ~pos ~typ Eval_tree.const_not_applicable
  | nodes ->
      let init = mk ~pos ~typ Eval_tree.const_false in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mk ~pos (Eval_tree.binop_or ~pos (transform_value node) acc) )

and transform_all_of ~pos nodes =
  let typ = Typ.literal ~pos Shared.Typ.Bool in
  match nodes with
  | [] ->
      mk ~pos ~typ Eval_tree.const_not_applicable
  | nodes ->
      let init = mk ~pos ~typ Eval_tree.const_true in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mk ~pos (Eval_tree.binop_and ~pos (transform_value node) acc) )

and transform_max_of ~pos nodes =
  let typ = Typ.any_number ~pos () in
  match nodes with
  | [] ->
      mk ~pos ~typ Eval_tree.const_not_applicable
  | n :: nodes ->
      let value = transform_value n in
      let init = {value with meta= typ} in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mk ~pos (Eval_tree.binop_max ~pos (transform_value node) acc) )

and transform_min_of ~pos nodes =
  let typ = Typ.any_number ~pos () in
  match nodes with
  | [] ->
      mk ~pos ~typ Eval_tree.const_not_applicable
  | n :: nodes ->
      let value = transform_value n in
      let init = {value with meta= typ} in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mk ~pos (Eval_tree.binop_min ~pos (transform_value node) acc) )

and transform_applicable_if ~pos condition value =
  let p = mk ~pos in
  let condition = transform_value condition in
  Eval_tree.(
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
  let p = mk ~pos in
  let condition = transform_value condition in
  Eval_tree.(
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
  let p = mk ~pos in
  (* TODO : structural sharing *)
  let floor = transform_value floor in
  Eval_tree.(
    p
      (mk_condition
         ~cond:
           (p
              (binop_and ~pos
                 (p (binop_neq ~pos floor (p const_not_applicable)))
                 (p (binop_lt ~pos value floor)) ) )
         ~then_:floor ~else_:value ) )

and transform_ceiling ~pos ceil value =
  let p = mk ~pos in
  (* TODO : structural sharing *)
  let ceil = transform_value ceil in
  Eval_tree.(
    p
      (mk_condition
         ~cond:
           (p
              (binop_and ~pos
                 (p (binop_neq ~pos ceil (p const_not_applicable)))
                 (p (binop_gt ~pos value ceil)) ) )
         ~then_:ceil ~else_:value ) )

and transform_context ~pos context value =
  mk ~pos
    (Set_context
       { context=
           List.map context ~f:(fun (rule_name, value) ->
               (rule_name, transform_value value) )
       ; value } )

and transform_default ~pos default value =
  let p = mk ~pos in
  Eval_tree.(
    p
      (mk_condition
         ~cond:(p (unop_is_not_defined ~pos value))
         ~then_:(transform_value default) ~else_:value ) )

and transform_variations ~pos (variations, else_) =
  let p = mk ~pos in
  let else_ =
    match else_ with
    | None ->
        p Eval_tree.const_not_applicable
    | Some else_ ->
        transform_value else_
  in
  List.fold_right variations ~init:else_ ~f:(fun {if_; then_} else_ ->
      let if_ = transform_value if_ in
      let then_ = transform_value then_ in
      Eval_tree.(
        p
          (mk_condition
             ~cond:(p (binop_eq ~pos if_ (p const_true)))
             ~then_ ~else_ ) ) )

and transform_is_not_applicable ~pos value =
  let p = mk ~pos in
  let value = transform_value value in
  Eval_tree.(p (binop_eq ~pos value (p const_not_applicable)))

and transform_is_applicable ~pos value =
  let p = mk ~pos in
  let value = transform_value value in
  Eval_tree.(p (binop_neq ~pos value (p const_not_applicable)))

and transform_typ t value =
  let pos = Pos.pos t in
  let typ =
    match Pos.value t with
    | Shared.Typ.Number None ->
        Typ.any_number ~pos ()
    | Shared.Typ.Number (Some unit) ->
        Typ.number_with_unit ~pos unit
    | Shared.Typ.Literal l ->
        Typ.literal ~pos l
  in
  {value with meta= typ}

and transform_round ~pos round value =
  let p = mk ~pos in
  let rounding, precision = round in
  p (Round (rounding, transform_value precision, value))

let from_ast (resolved_ast : Shared_ast.resolved) : t =
  let evalTree =
    Hashtbl.create
      (module Shared.Rule_name)
      ~size:(List.length resolved_ast) ~growth_allowed:false
  in
  List.iter resolved_ast ~f:(fun Shared_ast.{name; value; _} ->
      let key = Pos.value name in
      let data = transform_value ~undefined:(Get_context key) value in
      Hashtbl.add evalTree ~key ~data |> ignore ) ;
  evalTree
