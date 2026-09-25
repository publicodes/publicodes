open Base
open Shared
open Utils
open Output.Let_syntax

let transform_typ typ =
  match typ with
  | Ast.Any _ ->
      None
  | Ast.Typed (kind, (Any_kind _ | General)) -> (
    match kind with
    | KNumber u ->
        Some (Typ.TNumber (Some (Number_unit.to_concrete u)))
    | KBool ->
        Some Typ.TBool
    | KString ->
        Some Typ.TString
    | KDate ->
        Some Typ.TDate
    | KSymbol ->
        Some (Typ.TEnum []) )
  | Ast.Typed (_, (Literal lit | Enum [lit])) ->
      Some (Typ.Literal (Ast.literal_to_shared_typ lit))
  | Ast.Typed (_, Enum values) ->
      let values = List.map values ~f:Ast.literal_to_shared_typ in
      Some (Typ.TEnum values)

let rec to_expr (expr : Ast.typing_expr) : Shared_ast.typed_expr Output.t =
  let expr, mark = expr in
  let {Ast.pos; typ} = mark in
  let typ, _ = UnionFind.get typ in
  let typ = transform_typ typ in
  match expr with
  | Const (Number _) as expr ->
      Output.return (expr, {Shared_ast.pos; typ})
  | Const (Bool _) as expr ->
      Output.return (expr, {Shared_ast.pos; typ})
  | Const (String _) as expr ->
      Output.return (expr, {Shared_ast.pos; typ})
  | Const (Symbol _) as expr ->
      Output.return (expr, {Shared_ast.pos; typ})
  | Const (Date (Day _)) as expr ->
      Output.return (expr, {Shared_ast.pos; typ})
  | Const (Date (Month _)) as expr ->
      Output.return (expr, {Shared_ast.pos; typ})
  | Ref _ as expr ->
      Output.return (expr, {Shared_ast.pos; typ})
  | Binary_op (op, left, right) ->
      let* left = to_expr left in
      let* right = to_expr right in
      Output.return
        (Shared_ast.Binary_op (op, left, right), {Shared_ast.pos; typ})
  | Unary_op (op, value) ->
      let* value = to_expr value in
      Output.return (Shared_ast.Unary_op (op, value), {Shared_ast.pos; typ})

and to_value_mechanism (value : Ast.typing_value_mechanism) :
    Shared_ast.typed_value_mechanism Output.t =
  let to_values values = List.map values ~f:to_value |> Output.all_keep_logs in
  match value with
  | Expr expr ->
      let+ expr = to_expr expr in
      Shared_ast.Expr expr
  | Value value ->
      let+ value = to_value value in
      Shared_ast.Value value
  | Is_applicable value ->
      let+ value = to_value value in
      Shared_ast.Is_applicable value
  | Is_not_applicable value ->
      let+ value = to_value value in
      Shared_ast.Is_not_applicable value
  | Sum values ->
      let+ values = to_values values in
      Shared_ast.Sum values
  | Product values ->
      let+ values = to_values values in
      Shared_ast.Product values
  | Average values ->
      let+ values = to_values values in
      Shared_ast.Average values
  | All_of values ->
      let+ values = to_values values in
      Shared_ast.All_of values
  | Min_of values ->
      let+ values = to_values values in
      Shared_ast.Min_of values
  | Max_of values ->
      let+ values = to_values values in
      Shared_ast.Max_of values
  | One_of values ->
      let+ values = to_values values in
      Shared_ast.One_of values
  | Not_defined ->
      Output.return Shared_ast.Not_defined
  | Variations (variations, value) ->
      let* variations =
        List.map variations ~f:(fun variation ->
            let {Shared_ast.if_; then_} = variation in
            let* if_ = to_value if_ in
            let+ then_ = to_value then_ in
            {Shared_ast.if_; then_} )
        |> Output.all_keep_logs
      in
      let+ value =
        match value with
        | None ->
            Output.return None
        | Some value ->
            let+ value = to_value value in
            Some value
      in
      Shared_ast.Variations (variations, value)

and to_chainable_mechanism (chainable : Ast.typing_chainable_mechanism) :
    Shared_ast.typed_chainable_mechanism Output.t =
  match chainable with
  | Context values ->
      let+ values =
        List.map values ~f:(fun value ->
            let ref, value = value in
            let* value = to_value value in
            Output.return (ref, value) )
        |> Output.all_keep_logs
      in
      Shared_ast.Context values
  | Applicable_if value ->
      let+ value = to_value value in
      Shared_ast.Applicable_if value
  | Not_applicable_if value ->
      let+ value = to_value value in
      Shared_ast.Not_applicable_if value
  | Type typ ->
      Output.return (Shared_ast.Type typ)
  | Default value ->
      let+ value = to_value value in
      Shared_ast.Default value
  | Ceiling value ->
      let+ value = to_value value in
      Shared_ast.Ceiling value
  | Floor value ->
      let+ value = to_value value in
      Shared_ast.Floor value
  | Round (rounding, value) ->
      let+ value = to_value value in
      Shared_ast.Round (rounding, value)

and to_value (value : Ast.typing_value) : Shared_ast.typed_value Output.t =
  let {Shared_ast.value; chainable_mechanisms}, mark = value in
  let* value =
    let value, mark = value in
    let {Ast.pos; typ} = mark in
    let typ, _ = UnionFind.get typ in
    let* value = to_value_mechanism value in
    let typ = transform_typ typ in
    Output.return (value, {Shared_ast.pos; typ})
  in
  let* chainable_mechanisms =
    List.map chainable_mechanisms ~f:(fun chainable ->
        let chainable, mark = chainable in
        let {Ast.pos; typ} = mark in
        let typ, _ = UnionFind.get typ in
        let* chainable = to_chainable_mechanism chainable in
        let typ = transform_typ typ in
        Output.return (chainable, {Shared_ast.pos; typ}) )
    |> Output.all_keep_logs
  in
  let {Ast.pos; typ} = mark in
  let typ =
    let typ, _ = UnionFind.get typ in
    transform_typ typ
  in
  Output.return ({Shared_ast.value; chainable_mechanisms}, {Shared_ast.pos; typ})

let to_rule_def (rule_def : Ast.typing_rule_def) :
    Shared_ast.typed_rule_def Output.t =
  let {Shared_ast.value; _} = rule_def in
  let* value = to_value value in
  Output.return {rule_def with value}

let to_typed (ast : Ast.typing_tree) : Shared_ast.typed Output.t =
  let* rule_defs =
    Ast.get_sorted_rule_defs ast
    |> List.map ~f:to_rule_def |> Output.all_keep_logs
  in
  Output.return rule_defs
