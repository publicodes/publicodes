open Eval_tree.Raw
open Core
open Utils
open Shared

let mk = Eval_tree.Raw.mk ~typ:()

(* Helper function to convert between the two constant types *)
let convert_constant expr_const =
  match expr_const with
  | Shared_ast.Number (n, _) ->
      Number n
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
      mk ~pos (Unary_op (Pos.mk ~pos Neg, transform_expr expr))
  | Shared_ast.Ref name ->
      mk ~pos (Ref name)

and transform_value ?(undefined = Const Undefined) (node : 'a Shared_ast.value)
    =
  let value =
    match Pos.value node.value with
    | Shared_ast.Undefined ->
        mk ~pos:(Pos.pos node.value) undefined
    | _ ->
        transform_mecanism_value node.value
  in
  unfold_chainable_mecanism ~init:value node.chainable_mechanisms

and transform_mecanism_value (node, pos) =
  match node with
  | Shared_ast.Undefined ->
      mk ~pos (Const Undefined)
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
  | Shared_ast.Value value ->
      transform_value value

and unfold_chainable_mecanism ~init mecanisms =
  mecanisms
  |> List.sort ~compare:(fun a b ->
         [%compare: Rule_name.t Shared_ast.chainable_mechanism] (Pos.value a)
           (Pos.value b) )
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
             transform_default ~pos default acc )

and transform_sum ~pos nodes =
  List.fold_right nodes ~init:(mk ~pos (Const (Number 0.))) ~f:(fun node acc ->
      mk ~pos (Binary_op (Pos.mk ~pos Shared_ast.Add, transform_value node, acc)) )

and transform_product ~pos nodes =
  List.fold_right nodes ~init:(mk ~pos (Const (Number 1.))) ~f:(fun node acc ->
      mk ~pos (Binary_op (Pos.mk ~pos Shared_ast.Mul, transform_value node, acc)) )

and transform_any_of ~pos nodes =
  List.fold_right nodes ~init:(mk ~pos (Const (Bool false))) ~f:(fun node acc ->
      mk ~pos (Binary_op (Pos.mk ~pos Shared_ast.Or, transform_value node, acc)) )

and transform_all_of ~pos nodes =
  List.fold_right nodes ~init:(mk ~pos (Const (Bool true))) ~f:(fun node acc ->
      mk ~pos (Binary_op (Pos.mk ~pos Shared_ast.And, transform_value node, acc)) )

and transform_applicable_if ~pos condition value =
  let p = mk ~pos in
  let condition = transform_value condition in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.Or
              , p
                  (Binary_op
                     ( Pos.mk ~pos Shared_ast.Eq
                     , condition
                     , p (Const (Bool false)) ) )
              , p (Unary_op (Pos.mk ~pos Is_undef, condition)) ) )
       , p (Const Null)
       , value ) )

and transform_not_applicable_if ~pos condition value =
  let p = mk ~pos in
  let condition = transform_value condition in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.Or
              , p
                  (Binary_op
                     ( Pos.mk ~pos Shared_ast.Eq
                     , condition
                     , p (Const (Bool false)) ) )
              , p (Unary_op (Pos.mk ~pos Is_undef, condition)) ) )
       , value
       , p (Const Null) ) )

and transform_floor ~pos floor value =
  let p = mk ~pos in
  (* TODO : structural sharing *)
  let floor = transform_value floor in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.And
              , p
                  (Binary_op
                     (Pos.mk ~pos Shared_ast.NotEq, floor, p (Const Null)) )
              , p (Binary_op (Pos.mk ~pos Shared_ast.Gt, value, floor)) ) )
       , floor
       , value ) )

and transform_ceiling ~pos ceil value =
  let p = mk ~pos in
  (* TODO : structural sharing *)
  let ceil = transform_value ceil in
  p
    (Condition
       ( p
           (Binary_op
              ( Pos.mk ~pos Shared_ast.And
              , p
                  (Binary_op (Pos.mk ~pos Shared_ast.NotEq, ceil, p (Const Null))
                  )
              , p (Binary_op (Pos.mk ~pos Shared_ast.Lt, value, ceil)) ) )
       , ceil
       , value ) )

and transform_context ~pos context value =
  mk ~pos
    (Set_context
       { context=
           List.map context ~f:(fun (rule_name, value) ->
               (rule_name, transform_value value) )
       ; value } )

and transform_default ~pos default value =
  let p = mk ~pos in
  p
    (Condition
       ( p (Unary_op (Pos.mk ~pos Is_undef, value))
       , transform_value default
       , value ) )

let from_ast (resolved_ast : Shared_ast.resolved) : unit t =
  let evalTree =
    Rule_name.Hashtbl.create ~size:(List.length resolved_ast)
      ~growth_allowed:false ()
  in
  List.iter resolved_ast ~f:(fun Shared_ast.{name; value; _} ->
      let key = Pos.value name in
      let data = transform_value ~undefined:(Get_context key) value in
      Hashtbl.add evalTree ~key ~data |> ignore ) ;
  evalTree
