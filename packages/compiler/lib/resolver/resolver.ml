open Core
open Utils
open Shared
open Shared.Shared_ast
open Utils.Output

let check_orphan_rules ~rule_names ast =
  let warn_if_orphan {name= name, pos; _} =
    let parent = Rule_name.parent name in
    match parent with
    | None ->
        None
    | Some parent ->
        if not (Set.mem rule_names parent) then
          let code, message = Err.missing_parent_rule in
          Some
            (Log.error message ~code ~pos ~kind:`Syntax
               ~hints:
                 [ Format.asprintf "Ajoutez la règle parente `%a` manquante"
                     Rule_name.pp parent ] )
        else None
  in
  List.filter_map ast ~f:warn_if_orphan

let resolve_rule ~rule_names rule =
  let context_rule = Pos.value rule.name in
  let resolve_ref ~pos ref =
    let resolved_ref =
      Rule_name.resolve ~rule_names ~current:context_rule ref
    in
    match resolved_ref with
    | None ->
        let code, message = Err.missing_rule in
        let missing_rule_name = Rule_name.create_exn ref in
        (* TODO: add to suggest closest rule name *)
        fatal_error ~pos ~kind:`Syntax ~code message
          ~hints:
            [ Format.asprintf "Ajoutez la règle `%a` manquante" Rule_name.pp
                missing_rule_name
            ; "Vérifiez les erreurs de typos dans le nom de la règle" ]
    | Some ref ->
        return ref
  in
  let rec map_expr (expr, pos) =
    let+ expr =
      match expr with
      | Binary_op (op, left, right) ->
          let* mapped_left = map_expr left in
          let+ mapped_right = map_expr right in
          Binary_op (op, mapped_left, mapped_right)
      | Unary_op (op, operand) ->
          let+ mapped_operand = map_expr operand in
          Unary_op (op, mapped_operand)
      | Const c ->
          return (Const c)
      | Ref r ->
          let+ ref_value = resolve_ref ~pos r in
          Ref ref_value
    in
    (expr, pos)
  and map_chainable_mechanism ((value, pos) : 'a chainable_mechanism Pos.t) =
    let+ value =
      match value with
      | Applicable_if value ->
          let+ value = map_value value in
          Applicable_if value
      | Not_applicable_if value ->
          let+ value = map_value value in
          Not_applicable_if value
      | Ceiling value ->
          let+ value = map_value value in
          Ceiling value
      | Floor value ->
          let+ value = map_value value in
          Floor value
      | Context context ->
          let+ context =
            List.map context ~f:(fun ((ref, pos), value) ->
                let* rule = resolve_ref ~pos ref in
                let+ value = map_value value in
                ((rule, pos), value) )
            |> all_keep_logs
          in
          Context context
      | Default value ->
          let+ value = map_value value in
          Default value
      | Round (rounding, precision) ->
          let+ precision = map_value precision in
          Round (rounding, precision)
      | Type t ->
          return (Type t)
    in
    (value, pos)
  and map_value_mechanism ((value, pos) : 'a value_mechanism Pos.t) =
    let+ value =
      match value with
      | Expr expr ->
          let mapped_expr = map_expr expr >>| fun e -> Expr e in
          Output.default_to ~default:Undefined mapped_expr
      | Sum values ->
          let+ mapped_values = List.map values ~f:map_value |> all_keep_logs in
          Sum mapped_values
      | Product values ->
          let+ mapped_values = List.map values ~f:map_value |> all_keep_logs in
          Product mapped_values
      | All_of values ->
          let+ mapped_values = List.map values ~f:map_value |> all_keep_logs in
          All_of mapped_values
      | One_of values ->
          let+ mapped_values = List.map values ~f:map_value |> all_keep_logs in
          One_of mapped_values
      | Max_of values ->
          let+ mapped_values = List.map values ~f:map_value |> all_keep_logs in
          Max_of mapped_values
      | Min_of values ->
          let+ mapped_values = List.map values ~f:map_value |> all_keep_logs in
          Min_of mapped_values
      | Value value ->
          let+ value = map_value value in
          Value value
      | Is_applicable value ->
          let+ value = map_value value in
          Is_applicable value
      | Is_not_applicable value ->
          let+ value = map_value value in
          Is_not_applicable value
      | Undefined ->
          return Undefined
      | Variations (variations, else_) ->
          let* variations =
            List.map
              ~f:(fun {if_; then_} ->
                let* if_ = map_value if_ in
                let+ then_ = map_value then_ in
                {if_; then_} )
              variations
            |> all_keep_logs
          in
          let+ else_ =
            match else_ with
            | Some else_ ->
                let+ else_ = map_value else_ in
                Some else_
            | None ->
                return None
          in
          Variations (variations, else_)
    in
    (value, pos)
  and map_value (v : 'a value) =
    let* value = map_value_mechanism v.value in
    let+ chainable_mechanisms =
      v.chainable_mechanisms
      |> List.map ~f:map_chainable_mechanism
      |> all_keep_logs
    in
    {value; chainable_mechanisms}
  in
  let* value = map_value rule.value in
  return {rule with value}

let to_resolved_ast ast =
  let rule_names =
    Rule_name.Set.of_list (List.map ast ~f:(fun rule -> Pos.value rule.name))
  in
  let orphan_logs = check_orphan_rules ~rule_names ast in
  let+ ast =
    ast
    |> List.map ~f:(resolve_rule ~rule_names)
    |> all_keep_logs |> add_logs ~logs:orphan_logs
  in
  ast
