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

let get_unit_exn typ =
  match typ with
  | Some (Typ.TNumber (Some unit))
  | Some (Typ.Literal (LNumber (_, Some unit), _))
  | Some (Typ.TEnum ((LNumber (_, Some unit), _) :: _)) ->
      unit
  | _ ->
      failwith "No unit"

(** [transform_percent typ pos op left_value right_value] transforms a
    binary operation and handles the case where there is a percentage involved
    by multiplying by 100 to convert to the correct unit.


    For example the [10 % * 20 €] expression will be transformed into
    [(10 % * 20 €) * 0.01]. *)
let transform_percent typ pos op left_value right_value =
  let unit = get_unit_exn typ in
  let right_typ = left_value.meta in
  let left_typ = right_value.meta in
  let right_unit = get_unit_exn right_typ in
  let left_unit = get_unit_exn left_typ in
  let op_unit =
    match op with
    | Shared_ast.Mul, _ ->
        Units.mul right_unit left_unit
    | Shared_ast.Div, _ ->
        Units.mul right_unit (Units.inv left_unit)
    | _ ->
        failwith "Unexpected operator"
  in
  let expr = Binary_op (op, left_value, right_value) in
  if Units.equal op_unit unit then expr
  else
    let percent_pow_from = Map.find op_unit "%" |> Option.value ~default:0 in
    let percent_pow_to = Map.find unit "%" |> Option.value ~default:0 in
    Binary_op
      ( Mark.mk_pos ~pos Shared_ast.Mul
      , Tree.mk_value ~meta:typ ~pos expr
      , Tree.mk_value ~pos ~meta:(Some (Typ.TNumber (Some Units.empty)))
          (Const
             (Number
                (100. **. Float.of_int (percent_pow_to - percent_pow_from), None)
             ) ) )

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

and transform_expr
    ((expr, {pos; typ}) :
      (Shared.Rule_name.t, Shared_ast.typed_mark) Shared_ast.expr ) =
  let mk_value = Tree.mk_value ~meta:typ ~pos in
  match expr with
  | Const value ->
      mk_value (Const (convert_constant value))
  | Binary_op (((Shared_ast.Mul, _) as op), left, right)
  | Binary_op (((Shared_ast.Div, _) as op), left, right) ->
      let left_value = transform_expr left in
      let right_value = transform_expr right in
      let with_transformed_percent =
        transform_percent typ pos op left_value right_value
      in
      mk_value with_transformed_percent
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
  | Sum values ->
      transform_fold values ~pos ~typ ~f:(fun left right ->
          Tree.binop_add ~pos left right )
  | Product values ->
      let op = Mark.mk_pos Shared_ast.Mul ~pos in
      transform_fold values ~pos ~typ ~f:(transform_percent typ pos op)
  | Average values ->
      transform_average ~pos ~typ values
  | One_of values ->
      let init =
        Tree.mk_value ~pos
          ~meta:(Some (Typ.Literal (Mark.mk_pos ~pos Typ.(LBool false))))
          Tree.const_false
      in
      transform_fold values ~pos ~typ ~init ~f:(fun left right ->
          Tree.binop_or ~pos left right )
  | All_of values ->
      let init =
        Tree.mk_value ~pos
          ~meta:(Some (Typ.Literal (Mark.mk_pos ~pos Typ.(LBool true))))
          Tree.const_true
      in
      transform_fold values ~pos ~typ ~init ~f:(fun left right ->
          Tree.binop_and ~pos left right )
  | Min_of values ->
      transform_fold values ~pos ~typ ~f:(fun left right ->
          Tree.binop_min ~pos left right )
  | Max_of values ->
      transform_fold values ~pos ~typ ~f:(fun left right ->
          Tree.binop_max ~pos left right )
  | Value value ->
      transform value
  | Variations variations ->
      transform_variations ~pos ~typ variations
  | Is_applicable value ->
      transform_is_applicable ~pos ~typ value
  | Is_not_applicable value ->
      transform_is_not_applicable ~pos ~typ value
  | Is_defined value ->
      transform_is_defined ~pos ~typ value
  | Is_not_defined value ->
      transform_is_not_defined ~pos ~typ value

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

(** [transform_fold ~pos ~typ ?init ~f values] returns [f (... f (f (f init e1) e2) e3...) en],
    where [e1..en] are the transformed elements of [values] and [init] is the
    initial value (by default the first transformed element of [values]).

    If [values] is empty, returns the constant [NotApplicable] with the given
    [pos] and [typ]. *)
and transform_fold ~pos ~typ ?init ~f values =
  match values with
  | [] ->
      (* FIXME: is missing the type NotApplicable *)
      Tree.mk_value ~meta:typ ~pos Tree.const_not_applicable
  | hd :: tl ->
      let values = if Option.is_none init then tl else values in
      let init = match init with Some init -> init | None -> transform hd in
      List.fold ~init
        ~f:(fun acc node ->
          let naked_value = f acc (transform node) in
          Tree.mk_value ~pos ~meta:typ naked_value )
        values

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
      let first_value = transform n in
      let nodes = List.map nodes ~f:transform in
      let sum =
        List.fold nodes ~init:first_value ~f:(fun acc node ->
            p ~meta:typ (Tree.binop_add ~pos acc node) )
      in
      let count =
        let init = count_applicable first_value in
        let counts = List.map nodes ~f:count_applicable in
        List.fold counts ~init ~f:(fun acc node ->
            p ~meta:typ (Tree.binop_add ~pos acc node) )
      in
      p ~meta:typ (Tree.binop_div ~pos sum count)

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

and transform_is_not_defined ~pos ~typ value =
  let p = Tree.mk_value ~pos ~meta:typ in
  let value = transform value in
  Tree.(p (unop_is_not_defined ~pos value))

and transform_is_defined ~pos ~typ value =
  let p = Tree.mk_value ~pos ~meta:typ in
  let value = transform value in
  (* check if value is defined with "no" unop_is_not_defined *)
  Tree.(p (binop_eq ~pos (p (unop_is_not_defined ~pos value)) (p const_false)))

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
