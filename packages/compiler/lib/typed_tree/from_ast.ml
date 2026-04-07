open Typ
open Shared
open Shared.Eval_tree
open Base
open Utils
open Tree

(* Helper function to convert between the two constant types *)
let convert_constant expr_const =
  match expr_const with
  | Shared_ast.Number (n, unit) ->
      Number (n, unit)
  | Shared_ast.Bool b ->
      Bool b
  | Shared_ast.String s ->
      String s
  | Shared_ast.Date d ->
      Date d

let rec transform_expr id (expr, pos) =
  match expr with
  | Shared_ast.Const value ->
      mknew ~pos ~id (Const (convert_constant value))
  | Shared_ast.Binary_op (op, left, right) ->
      mknew ~pos ~id
        (Binary_op (op, transform_expr id left, transform_expr id right))
  | Shared_ast.(Unary_op ((Neg, pos), expr)) ->
      mknew ~pos ~id (Unary_op (Pos.mk ~pos Neg, transform_expr id expr))
  | Shared_ast.Ref name ->
      mknew ~pos ~id (Ref name)

and transform_value ?(undefined = Const Undefined) (id : int ref)
    (node : 'a Shared_ast.value) =
  let value =
    match Pos.value node.value with
    | Shared_ast.Undefined ->
        mknew ~pos:(Pos.pos node.value) ~id undefined
    | _ ->
        transform_mechanism_value id node.value
  in
  unfold_chainable_mechanism ~init:value id node.chainable_mechanisms

and transform_mechanism_value id (node, pos) =
  match node with
  | Shared_ast.Undefined ->
      mknew ~pos ~id (Const Undefined)
  | Shared_ast.Expr expr ->
      transform_expr id expr
  | Shared_ast.Sum sum ->
      transform_sum ~pos id sum
  | Shared_ast.Product product ->
      transform_product ~pos id product
  | Shared_ast.One_of any_of ->
      transform_any_of ~pos id any_of
  | Shared_ast.All_of all_of ->
      transform_all_of ~pos id all_of
  | Shared_ast.Min_of all_of ->
      transform_min_of ~pos id all_of
  | Shared_ast.Max_of all_of ->
      transform_max_of ~pos id all_of
  | Shared_ast.Value value ->
      transform_value id value
  | Shared_ast.Variations variations ->
      transform_variations ~pos id variations
  | Shared_ast.Is_applicable value ->
      transform_is_applicable ~pos id value
  | Shared_ast.Is_not_applicable value ->
      transform_is_not_applicable ~pos id value

and unfold_chainable_mechanism ~init id mechanisms =
  mechanisms
  |> List.sort ~compare:(fun a b ->
      Shared_ast.compare_chainable_mechanism Rule_name.compare (Pos.value a)
        (Pos.value b) )
  |> List.fold_right ~init ~f:(fun (mec, pos) acc ->
      match mec with
      | Shared_ast.Applicable_if applicable_if ->
          transform_applicable_if ~pos id applicable_if acc
      | Shared_ast.Not_applicable_if not_applicable_if ->
          transform_not_applicable_if ~pos id not_applicable_if acc
      | Shared_ast.Ceiling ceiling ->
          transform_ceiling ~pos id ceiling acc
      | Shared_ast.Floor floor ->
          transform_floor ~pos id floor acc
      | Shared_ast.Context context ->
          transform_context ~pos id context acc
      | Shared_ast.Default default ->
          transform_default ~pos id default acc
      | Shared_ast.Type t ->
          transform_typ t acc
      | Shared_ast.Round round ->
          transform_round ~pos id round acc )

(* TODO: a lot of factorisation possible here! *)
and transform_sum ~pos id nodes =
  let typ = any_number () ~pos in
  match nodes with
  | [] ->
      mknew ~pos ~id ~typ (Const Null)
  | n :: nodes ->
      let value = transform_value id n in
      let init = {value with meta= typ} in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mknew ~pos ~id
            (Binary_op (Pos.mk ~pos Shared_ast.Add, transform_value id node, acc)
            ) )

and transform_product ~pos id nodes =
  let typ = any_number () ~pos in
  match nodes with
  | [] ->
      mknew ~pos ~id ~typ (Const Null)
  | n :: nodes ->
      let value = transform_value id n in
      let init = {value with meta= typ} in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mknew ~pos ~id
            (Binary_op (Pos.mk ~pos Shared_ast.Mul, transform_value id node, acc)
            ) )

and transform_any_of ~pos id nodes =
  let typ = literal ~pos Bool in
  match nodes with
  | [] ->
      mknew ~pos ~id ~typ (Const Null)
  | nodes ->
      let init = mknew ~pos ~id ~typ (Const (Bool false)) in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mknew ~pos ~id
            (Binary_op (Pos.mk ~pos Shared_ast.Or, transform_value id node, acc)) )

and transform_all_of ~pos id nodes =
  let typ = literal ~pos Bool in
  match nodes with
  | [] ->
      mknew ~pos ~id ~typ (Const Null)
  | nodes ->
      let init = mknew ~pos ~id ~typ (Const (Bool true)) in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mknew ~pos ~id
            (Binary_op (Pos.mk ~pos Shared_ast.And, transform_value id node, acc)
            ) )

and transform_max_of ~pos id nodes =
  let typ = any_number ~pos () in
  match nodes with
  | [] ->
      mknew ~pos ~id ~typ (Const Null)
  | n :: nodes ->
      let value = transform_value id n in
      let init = {value with meta= typ} in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mknew ~pos ~id
            (Binary_op (Pos.mk ~pos Shared_ast.Max, transform_value id node, acc)
            ) )

and transform_min_of ~pos id nodes =
  let typ = any_number ~pos () in
  match nodes with
  | [] ->
      mknew ~pos ~typ ~id (Const Null)
  | n :: nodes ->
      let value = transform_value id n in
      let init = {value with meta= typ} in
      List.fold_right nodes ~init ~f:(fun node acc ->
          mknew ~pos ~id
            (Binary_op (Pos.mk ~pos Shared_ast.Min, transform_value id node, acc)
            ) )

and transform_applicable_if ~pos id condition value =
  let p = mknew ~pos ~id in
  let condition = transform_value id condition in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.Or
              , p (Unary_op (Pos.mk ~pos Is_undef, condition))
              , p
                  (Binary_op
                     ( Pos.mk ~pos Shared_ast.Or
                     , p
                         (Binary_op
                            ( Pos.mk ~pos Shared_ast.Eq
                            , condition
                            , p (Const (Bool false)) ) )
                     , p
                         (Binary_op
                            ( Pos.mk ~pos Shared_ast.Eq
                            , condition
                            , p (Const Null) ) ) ) ) ) )
       , p (Const Null)
       , value ) )

and transform_not_applicable_if ~pos id condition value =
  let p = mknew ~pos ~id in
  let condition = transform_value id condition in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.Or
              , p (Unary_op (Pos.mk ~pos Is_undef, condition))
              , p
                  (Binary_op
                     ( Pos.mk ~pos Shared_ast.Or
                     , p
                         (Binary_op
                            ( Pos.mk ~pos Shared_ast.Eq
                            , condition
                            , p (Const (Bool false)) ) )
                     , p
                         (Binary_op
                            ( Pos.mk ~pos Shared_ast.Eq
                            , condition
                            , p (Const Null) ) ) ) ) ) )
       , value
       , p (Const Null) ) )

and transform_floor ~pos id floor value =
  let p = mknew ~pos ~id in
  (* TODO : structural sharing *)
  let floor = transform_value id floor in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.And
              , p
                  (Binary_op
                     (Pos.mk ~pos Shared_ast.NotEq, floor, p (Const Null)) )
              , p (Binary_op (Pos.mk ~pos Shared_ast.Lt, value, floor)) ) )
       , floor
       , value ) )

and transform_ceiling ~pos id ceil value =
  let p = mknew ~pos ~id in
  (* TODO : structural sharing *)
  let ceil = transform_value id ceil in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.And
              , p
                  (Binary_op (Pos.mk ~pos Shared_ast.NotEq, ceil, p (Const Null))
                  )
              , p (Binary_op (Pos.mk ~pos Shared_ast.Gt, value, ceil)) ) )
       , ceil
       , value ) )

and transform_context ~pos id context value =
  mknew ~pos ~id
    (Set_context
       { context=
           List.map context ~f:(fun (rule_name, value) ->
               (rule_name, transform_value id value) )
       ; value } )

and transform_default ~pos id default value =
  let p = mknew ~pos ~id in
  p
    (Condition
       ( p (Unary_op (Pos.mk ~pos Is_undef, value))
       , transform_value id default
       , value ) )

and transform_variations ~pos id (variations, else_) =
  let p = mknew ~pos ~id in
  let else_ =
    Option.value_map ~default:(p (Const Null))
      ~f:(fun var -> transform_value id var)
      else_
  in
  List.fold_right variations ~init:else_ ~f:(fun {if_; then_} acc ->
      let if_ = transform_value id if_ in
      let then_ = transform_value id then_ in
      p
        (Condition
           ( p
               (Binary_op
                  ( Pos.mk ~pos Shared_ast.Or
                  , p
                      (Binary_op (Pos.mk ~pos Shared_ast.Eq, if_, p (Const Null))
                      )
                  , p
                      (Binary_op
                         (Pos.mk ~pos Shared_ast.Eq, if_, p (Const (Bool false)))
                      ) ) )
           , acc
           , then_ ) ) )

and transform_is_not_applicable ~pos id value =
  let p = mknew ~pos ~id in
  let value = transform_value id value in
  p (Binary_op (Pos.mk ~pos Shared_ast.Eq, value, p (Const Null)))

and transform_is_applicable ~pos id value =
  let p = mknew ~pos ~id in
  let value = transform_value id value in
  p (Binary_op (Pos.mk ~pos Shared_ast.NotEq, value, p (Const Null)))

and transform_typ t value =
  let pos = Pos.pos t in
  let typ =
    match Pos.value t with
    | Shared.Typ.Number None ->
        any_number ~pos ()
    | Shared.Typ.Number (Some unit) ->
        number_with_unit ~pos unit
    | Shared.Typ.Literal l ->
        literal ~pos l
  in
  {value with meta= typ}

and transform_round ~pos id round value =
  let p = mknew ~pos ~id in
  let rounding, precision = round in
  p (Round (rounding, transform_value id precision, value))

let from_ast (resolved_ast : Shared_ast.resolved) : t =
  let evalTree =
    Hashtbl.create
      (module Rule_name)
      ~size:(List.length resolved_ast) ~growth_allowed:false
  in
  let id = ref 0 in
  List.iter resolved_ast ~f:(fun Shared_ast.{name; value; _} ->
      let key = Pos.value name in
      let data = transform_value ~undefined:(Get_context key) id value in
      Hashtbl.add evalTree ~key ~data |> ignore ) ;
  evalTree
