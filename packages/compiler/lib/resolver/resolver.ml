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
          Some
            (Log.error ~pos ~kind:`Syntax
               ~hint:
                 (Format.asprintf {|Créez une règle vide pour le parent:

%a:
|}
                    Rule_name.pp parent )
               "Le parent de la règle n'existe pas" )
        else None
  in
  List.filter_map ast ~f:warn_if_orphan

let resolve_rule ~rule_names rule =
  let context_rule = Pos.value rule.name in
  let resolve_ref ~pos ref =
    let ref = Rule_name.resolve ~rule_names ~current:context_rule ref in
    match ref with
    | None ->
        fatal_error ~pos ~kind:`Syntax "La référence n'existe pas"
    | Some ref ->
        return ref
  in
  let+ value =
    map_value ~default_node:Undefined
      ~f_expr:(map_expr ~f_ref:resolve_ref)
      rule.value
  in
  {rule with value}

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
