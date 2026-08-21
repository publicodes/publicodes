open Utils
open Base
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
    (value : Shared_ast.typed_value) : Typ.t option Tree.value =
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

and get_unit_exn typ =
  match typ with
  | Some (Typ.TNumber (Some unit))
  | Some (Typ.Literal (LNumber (_, Some unit), _))
  | Some (Typ.TEnum ((LNumber (_, Some unit), _) :: _)) ->
      unit
  | _ ->
      failwith "No unit"

and transform_decimal ~pos ~typ expr from_unit to_unit =
  let percent_pow_from = Map.find from_unit "%" |> Option.value ~default:0 in
  let percent_pow_to = Map.find to_unit "%" |> Option.value ~default:0 in
  Tree.mk_value ~pos ~meta:typ
    (Binary_op
       ( Mark.mk_pos ~pos Shared_ast.Mul
       , expr
       , Tree.mk_value ~pos ~meta:(Some (Typ.TNumber (Some Units.empty)))
           (Const
              (Number
                 ( 100. **. Float.of_int (percent_pow_to - percent_pow_from)
                 , None ) ) ) ) )

and transform_expr
    ((expr, {pos; typ}) :
      (Shared.Rule_name.t, Shared_ast.typed_mark) Shared_ast.expr ) =
  let mk_value = Tree.mk_value ~meta:typ ~pos in
  match expr with
  | Const value ->
      mk_value (Const (convert_constant value))
  | Binary_op
      ( (((Shared_ast.Mul as op_kind), _) as op)
      , ((_, {Shared_ast.typ= right_typ; _}) as left)
      , ((_, {Shared_ast.typ= left_typ; _}) as right) )
  | Binary_op
      ( (((Shared_ast.Div as op_kind), _) as op)
      , ((_, {Shared_ast.typ= right_typ; _}) as left)
      , ((_, {Shared_ast.typ= left_typ; _}) as right) ) ->
      let unit = get_unit_exn typ in
      let right_unit = get_unit_exn right_typ in
      let left_unit = get_unit_exn left_typ in
      let open Units in
      let op_unit =
        match op_kind with
        | Shared_ast.Mul ->
            mul right_unit left_unit
        | Shared_ast.Div ->
            mul right_unit (inv left_unit)
        | _ ->
            failwith "Unexpected operator"
      in
      let expr : Typ.t option value =
        mk_value (Binary_op (op, transform_expr left, transform_expr right))
      in
      if not (equal op_unit unit) then
        transform_decimal ~pos ~typ expr op_unit unit
      else expr
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
      transform_sum ~pos ~typ sum
  | Product product ->
      transform_product ~pos ~typ product
  | Average average ->
      transform_average ~pos ~typ average
  | One_of any_of ->
      transform_any_of ~pos ~typ any_of
  | All_of all_of ->
      transform_all_of ~pos ~typ all_of
  | Min_of all_of ->
      transform_min_of ~pos ~typ all_of
  | Max_of all_of ->
      transform_max_of ~pos ~typ all_of
  | Value value ->
      transform value
  | Variations variations ->
      transform_variations ~pos ~typ variations
  | Is_applicable value ->
      transform_is_applicable ~pos ~typ value
  | Is_not_applicable value ->
      transform_is_not_applicable ~pos ~typ value
  | Root_finding {with_; tolerance; min; max} ->
      let with_ = List.map with_ ~f:Mark.remove in
      Tree.mk_value ~pos ~meta:typ
        (Tree.mk_root_finding ~with_ ~tolerance ~min ~max)

and unfold_chainable_mechanism ~init mechanisms =
  mechanisms
  |> List.sort ~compare:(fun (a, _) (b, _) ->
      Shared_ast.compare_chainable_mechanism Shared.Rule_name.compare
        Shared_ast.compare_typed_mark a b )
  |> List.fold_right ~init
       ~f:(fun
           ((mec, {pos; typ}) : (_, Shared_ast.typed_mark) Mark.ed)
           (acc : Typ.t option value)
         ->
         match mec with
         | Shared_ast.Type _ ->
             {acc with meta= typ}
         | Applicable_if applicable_if ->
             transform_applicable_if ~pos ~typ applicable_if acc
         | Not_applicable_if not_applicable_if ->
             transform_not_applicable_if ~pos ~typ not_applicable_if acc
         | Ceiling ceiling ->
             transform_ceiling ~pos ~typ ceiling acc
         | Floor floor ->
             transform_floor ~pos ~typ floor acc
         | Context context ->
             transform_context ~pos ~typ context acc
         | Default default ->
             transform_default ~pos ~typ default acc
         | Round round ->
             transform_round ~pos ~typ round acc )

(* TODO: a lot of factorisation possible here! *)
and transform_sum ~pos ~typ nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:(Some Typ.TBool) ~pos Tree.const_not_applicable
  | n :: nodes ->
      let value = transform n in
      List.fold_right nodes ~init:value ~f:(fun node acc ->
          Tree.mk_value ~pos ~meta:typ
            (Tree.binop_add ~pos (transform node) acc) )

and transform_product ~pos ~typ nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:(Some Typ.TBool) ~pos Tree.const_not_applicable
  | n :: nodes ->
      let value = transform n in
      List.fold_right nodes ~init:value ~f:(fun node acc ->
          Tree.mk_value ~pos ~meta:typ
            (Tree.binop_mul ~pos (transform node) acc) )

and transform_average ~pos ~typ nodes =
  let p = Tree.mk_value ~pos in
  (* if applicable then 1. else 0. *)
  let count_applicable node =
    let cond =
      p ~meta:(Some Typ.TBool)
        (binop_neq ~pos node
           (p ~meta:(Some Typ.TBool) Tree.const_not_applicable) )
    in
    let then_ =
      let meta =
        Some (Typ.Literal (Mark.mk_pos ~pos (Typ.LNumber (1., None))))
      in
      p ~meta (Tree.const_number 1.)
    in
    let else_ =
      let meta =
        Some (Typ.Literal (Mark.mk_pos ~pos (Typ.LNumber (0., None))))
      in
      p ~meta (Tree.const_number 0.)
    in
    p ~meta:(Some (Typ.TNumber None)) (mk_condition ~cond ~then_ ~else_)
  in
  match nodes with
  | [] ->
      p (* FIXME: is missing the type NotApplicable *)
        ~meta:(Some Typ.TBool) Tree.const_not_applicable
  | n :: nodes ->
      let value = transform n in
      let nodes = List.map nodes ~f:transform in
      let sum =
        let init = value in
        List.fold_right nodes ~init ~f:(fun node acc ->
            p ~meta:typ (Tree.binop_add ~pos node acc) )
      in
      let count =
        let init = count_applicable value in
        let counts = List.map nodes ~f:count_applicable in
        List.fold_right counts ~init ~f:(fun node acc ->
            p ~meta:typ (Tree.binop_add ~pos node acc) )
      in
      p ~meta:typ (Tree.binop_div ~pos sum count)

and transform_any_of ~pos ~typ nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:(Some Typ.TBool) ~pos Tree.const_not_applicable
  | nodes ->
      let init =
        Tree.mk_value ~pos
          ~meta:(Some (Typ.Literal (Mark.mk_pos ~pos Typ.(LBool false))))
          Tree.const_false
      in
      List.fold_right nodes ~init ~f:(fun node acc ->
          Tree.mk_value ~pos ~meta:typ (Tree.binop_or ~pos (transform node) acc) )

and transform_all_of ~pos ~typ nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:(Some Typ.TBool) ~pos Tree.const_not_applicable
  | nodes ->
      let init =
        Tree.mk_value ~pos
          ~meta:(Some (Typ.Literal (Mark.mk_pos ~pos Typ.(LBool true))))
          Tree.const_true
      in
      List.fold_right nodes ~init ~f:(fun node acc ->
          Tree.mk_value ~pos ~meta:typ
            (Tree.binop_and ~pos (transform node) acc) )

and transform_max_of ~pos ~typ nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:(Some Typ.TBool) ~pos Tree.const_not_applicable
  | n :: nodes ->
      let value = transform n in
      List.fold_right nodes ~init:value ~f:(fun node acc ->
          Tree.mk_value ~pos ~meta:typ
            (Tree.binop_max ~pos (transform node) acc) )

and transform_min_of ~pos ~typ nodes =
  match nodes with
  | [] ->
      Tree.mk_value (* FIXME: is missing the type NotApplicable *)
        ~meta:(Some Typ.TBool) ~pos Tree.const_not_applicable
  | n :: nodes ->
      let value = transform n in
      List.fold_right nodes ~init:value ~f:(fun node acc ->
          Tree.mk_value ~pos ~meta:typ
            (Tree.binop_min ~pos (transform node) acc) )

and transform_applicable_if ~pos ~typ condition value =
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

and transform_not_applicable_if ~pos ~typ condition value =
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

and transform_floor ~pos ~typ floor value =
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

and transform_ceiling ~pos ~typ ceil value =
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

and transform_context ~pos ~typ context value =
  (* FIXME: add a type for context values *)
  Tree.mk_value ~pos ~meta:typ
    (Set_context
       { context=
           List.map context ~f:(fun (rule_name, value) ->
               (rule_name, transform value) )
       ; value } )

and transform_default ~pos ~typ default value =
  let p = Tree.mk_value ~pos ~meta:typ in
  Tree.(
    p
      (mk_condition
         ~cond:(p (unop_is_not_defined ~pos value))
         ~then_:(transform default) ~else_:value ) )

and transform_variations ~pos ~typ (variations, else_) =
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

and transform_is_not_applicable ~pos ~typ value =
  let p = Tree.mk_value ~pos ~meta:typ in
  let value = transform value in
  Tree.(p (binop_eq ~pos value (p const_not_applicable)))

and transform_is_applicable ~pos ~typ value =
  let p = Tree.mk_value ~pos ~meta:typ in
  let value = transform value in
  Tree.(p (binop_neq ~pos value (p const_not_applicable)))

and transform_round ~pos ~typ round value =
  let p = Tree.mk_value ~pos ~meta:typ in
  let rounding, ((_, {Shared_ast.typ; _}) as precision) = round in
  let precision =
    match typ with
    | Some TBool | Some (Literal (LBool _, _)) | Some (TEnum ((LBool _, _) :: _))
      ->
        p
          (mk_condition ~cond:(transform precision)
             ~then_:(p (Const (Tree.Number (1., None))))
             ~else_:(p const_not_applicable) )
    | Some (TNumber (Some unit))
    | Some (Literal (LNumber (_, Some unit), _))
    | Some (TEnum ((LNumber (_, Some unit), _) :: _))
      when Units.equal unit (Units.parse_unit "décimales") ->
        p
          (binop_pow ~pos
             (p (Const (Tree.Number (10., None))))
             (p (Unary_op (Mark.mk_pos ~pos Tree.Neg, transform precision))) )
    | _ ->
        transform precision
  in
  p (Round (rounding, precision, value))
