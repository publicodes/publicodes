open Base
open Shared
open Utils
open Output

let transform_typ typ =
  match typ with
  | Ast.Any _ ->
      None
  | Ast.Any_number u ->
      Some (Typ.TNumber (Some (Number_unit.to_concrete u)))
  | Ast.Any_bool _ ->
      Some Typ.TBool
  | Ast.Any_string _ ->
      Some Typ.TString
  | Ast.Any_date _ ->
      Some Typ.TDate
  | Ast.Literal (Ast.LNumber (f, u), pos) ->
      let lit = Typ.LNumber (f, Some (Number_unit.to_concrete u)) in
      Some (Typ.Literal (lit, pos))
  | Ast.Literal (Ast.LBool b, pos) ->
      let lit = Typ.LBool b in
      Some (Typ.Literal (lit, pos))
  | Ast.Literal (Ast.LString s, pos) ->
      let lit = Typ.LString s in
      Some (Typ.Literal (lit, pos))
  | Ast.Literal (Ast.LSymbol s, pos) ->
      let lit = Typ.LSymbol s in
      Some (Typ.Literal (lit, pos))
  | Ast.Literal (Ast.LDate d, pos) ->
      let lit = Typ.LDate d in
      Some (Typ.Literal (lit, pos))
  | Ast.TString ->
      Some Typ.TString
  | Ast.TBool ->
      Some Typ.TBool
  | Ast.TDate ->
      Some Typ.TDate
  | Ast.TNumber unit ->
      Some (Typ.TNumber (Some (Number_unit.to_concrete unit)))
  | Ast.TEnum [value] ->
      let lit, pos =
        match value with
        | LNumber (f, u), pos ->
            (Typ.LNumber (f, Some (Number_unit.to_concrete u)), pos)
        | LBool b, pos ->
            (Typ.LBool b, pos)
        | LString s, pos ->
            (Typ.LString s, pos)
        | LSymbol s, pos ->
            (Typ.LSymbol s, pos)
        | LDate d, pos ->
            (Typ.LDate d, pos)
      in
      Some (Typ.Literal (lit, pos))
  | Ast.TEnum values ->
      let values =
        List.map values ~f:(function
          | LNumber (f, u), pos ->
              (Typ.LNumber (f, Some (Number_unit.to_concrete u)), pos)
          | LBool b, pos ->
              (Typ.LBool b, pos)
          | LString s, pos ->
              (Typ.LString s, pos)
          | LSymbol s, pos ->
              (Typ.LSymbol s, pos)
          | LDate d, pos ->
              (Typ.LDate d, pos) )
      in
      Some (Typ.TEnum values)

let rec to_expr (expr : Ast.wip_expr) : Shared_ast.typed_expr Output.t =
  let expr, union = expr in
  let {Ast.pos; typ} = UnionFind.get union in
  let typ = transform_typ typ in
  match expr with
  | Const (Number _) as expr ->
      return (expr, {Shared_ast.pos; typ})
  | Const (Bool _) as expr ->
      return (expr, {Shared_ast.pos; typ})
  | Const (String _) as expr ->
      return (expr, {Shared_ast.pos; typ})
  | Const (Symbol _) as expr ->
      return (expr, {Shared_ast.pos; typ})
  | Const (Date (Day _)) as expr ->
      return (expr, {Shared_ast.pos; typ})
  | Const (Date (Month _)) as expr ->
      return (expr, {Shared_ast.pos; typ})
  | Ref _ as expr ->
      return (expr, {Shared_ast.pos; typ})
  | Binary_op (op, left, right) ->
      let* left = to_expr left in
      let* right = to_expr right in
      return (Shared_ast.Binary_op (op, left, right), {Shared_ast.pos; typ})
  | Unary_op (op, value) ->
      let* value = to_expr value in
      return (Shared_ast.Unary_op (op, value), {Shared_ast.pos; typ})

and to_value_mechanism (value : Ast.wip_value_mechanism) :
    Shared_ast.typed_value_mechanism Output.t =
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
      let+ values = List.map values ~f:to_value |> all_keep_logs in
      Shared_ast.Sum values
  | Product values ->
      let+ values = List.map values ~f:to_value |> all_keep_logs in
      Shared_ast.Product values
  | All_of values ->
      let+ values = List.map values ~f:to_value |> all_keep_logs in
      Shared_ast.All_of values
  | Min_of values ->
      let+ values = List.map values ~f:to_value |> all_keep_logs in
      Shared_ast.Min_of values
  | Max_of values ->
      let+ values = List.map values ~f:to_value |> all_keep_logs in
      Shared_ast.Max_of values
  | One_of values ->
      let+ values = List.map values ~f:to_value |> all_keep_logs in
      Shared_ast.One_of values
  | Not_defined ->
      return Shared_ast.Not_defined
  | Variations (variations, value) ->
      let* variations =
        List.map variations ~f:(fun variation ->
            let {Shared_ast.if_; then_} = variation in
            let* if_ = to_value if_ in
            let+ then_ = to_value then_ in
            {Shared_ast.if_; then_} )
        |> all_keep_logs
      in
      let+ value =
        match value with
        | None ->
            return None
        | Some value ->
            let+ value = to_value value in
            Some value
      in
      Shared_ast.Variations (variations, value)

and to_chainable_mechanism (chainable : Ast.wip_chainable_mechanism) :
    Shared_ast.typed_chainable_mechanism Output.t =
  match chainable with
  | Context values ->
      let+ values =
        List.map values ~f:(fun value ->
            let ref, value = value in
            let* value = to_value value in
            return (ref, value) )
        |> all_keep_logs
      in
      Shared_ast.Context values
  | Applicable_if value ->
      let+ value = to_value value in
      Shared_ast.Applicable_if value
  | Not_applicable_if value ->
      let+ value = to_value value in
      Shared_ast.Not_applicable_if value
  | Type typ ->
      return (Shared_ast.Type typ)
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

and to_value (value : Ast.wip_value) : Shared_ast.typed_value Output.t =
  let {Shared_ast.value; chainable_mechanisms}, union = value in
  let {Ast.pos; typ} = UnionFind.get union in
  let* value =
    let value, union = value in
    let {Ast.pos; typ} = UnionFind.get union in
    let* value = to_value_mechanism value in
    let typ = transform_typ typ in
    return (value, {Shared_ast.pos; typ})
  in
  let* chainable_mechanisms =
    List.map chainable_mechanisms ~f:(fun chainable ->
        let chainable, union = chainable in
        let {Ast.pos; typ} = UnionFind.get union in
        let* chainable = to_chainable_mechanism chainable in
        let typ = transform_typ typ in
        return (chainable, {Shared_ast.pos; typ}) )
    |> all_keep_logs
  in
  let typ = transform_typ typ in
  return ({Shared_ast.value; chainable_mechanisms}, {Shared_ast.pos; typ})

let to_rule_def (rule_def : Ast.wip_rule_def) :
    Shared_ast.typed_rule_def Output.t =
  let {Shared_ast.value; _} = rule_def in
  let* value = to_value value in
  return {rule_def with value}

let to_typed (ast : Ast.wip_tree) : Shared_ast.typed Output.t =
  let* rule_defs =
    Hashtbl.to_alist ast |> List.map ~f:snd
    |> List.sort
         ~compare:(fun
             ({Shared_ast.name= _, {Mark.pos= p1}; _}, _)
             ({Shared_ast.name= _, {Mark.pos= p2}; _}, _)
           -> Pos.compare p1 p2 )
    |> List.map ~f:fst |> List.map ~f:to_rule_def |> all_keep_logs
  in
  return rule_defs
