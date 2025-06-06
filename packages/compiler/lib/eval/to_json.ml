open Core
open Shared
open Eval_tree
open Utils

let rec computation_to_json (eval_tree : Eval_tree.typ_computation) =
  match eval_tree.value with
  | Get_context name ->
      `Assoc [("get", `String (Shared.Rule_name.to_string name))]
  | Set_context {context; value} ->
      let context =
        List.map context ~f:(fun (rule_name, value) ->
            ( Shared.Rule_name.to_string (Pos.value rule_name)
            , computation_to_json value ) )
      in
      let value = computation_to_json value in
      `Assoc [("value", value); ("context", `Assoc context)]
  | Ref name ->
      `String (Shared.Rule_name.to_string name)
  | Const c -> (
    match c with
    | Number (n, _) ->
        `List [`Float n]
    | Bool b ->
        `Bool b
    | String s ->
        `List [`String s]
    | Date (Day {day; month; year}) ->
        `Assoc [("d", `String (Printf.sprintf "%d-%02d-%02d" year month day))]
    | Date (Month {month; year}) ->
        `Assoc [("d", `String (Printf.sprintf "%02d-%02d" year month))]
    | Undefined ->
        `List []
    | Null ->
        `Null )
  | Condition (cond, then_expr, else_expr) ->
      `Assoc
        [ ("if", computation_to_json cond)
        ; ("then", computation_to_json then_expr)
        ; ("else", computation_to_json else_expr) ]
  | Binary_op ((op, _), left, right) ->
      let op_str =
        match op with
        | Add ->
            "+"
        | Sub ->
            "-"
        | Mul ->
            "*"
        | Div ->
            "/"
        | Pow ->
            "**"
        | Gt ->
            ">"
        | Lt ->
            "<"
        | GtEq ->
            ">="
        | LtEq ->
            "<="
        | Eq ->
            "="
        | NotEq ->
            "!="
        | And ->
            "&&"
        | Or ->
            "||"
      in
      `List [computation_to_json left; `String op_str; computation_to_json right]
  | Unary_op ((op, _), expr) ->
      let op_str = match op with Neg -> "-" | Is_undef -> "∅" in
      `List [`String op_str; computation_to_json expr]

let json_of_eval_tree (eval_tree : Eval_tree.t) =
  (* Convert a dotted name to string representation *)
  (* Recursively convert a computation to JSON *)

  (* Build the JSON object by iterating through the rules *)
  let json_assoc =
    Hashtbl.fold eval_tree ~init:[] ~f:(fun ~key:rule ~data acc ->
        (Shared.Rule_name.to_string rule, computation_to_json data) :: acc )
  in
  `Assoc json_assoc

let with_parameters eval_tree params =
  let parameters_json =
    `Assoc
      (List.map params ~f:(fun (key, value) ->
           ( Rule_name.to_string key
           , `Assoc
               (List.map value ~f:(fun rule ->
                    (Rule_name.to_string rule, `Null) ) ) ) ) )
  in
  let types_json =
    `Assoc
      (List.map params ~f:(fun (key, _) ->
           ( Rule_name.to_string key
           , match get_type eval_tree key with
             | Number unit -> (
               match Number_unit.normalize unit with
               | {concrete; elem= []; inv= []} ->
                   `Assoc
                     [ ("number", `Null)
                     ; ("unit", `String (Format.asprintf "%a" Units.pp concrete))
                     ]
               | _ ->
                   `Assoc [("number", `Null)] )
             | Literal String ->
                 `Assoc [("string", `Null)]
             | Literal Bool ->
                 `Assoc [("boolean", `Null)]
             | Literal Date ->
                 `Assoc [("date", `Null)]
             | _ ->
                 `Null ) ) )
  in
  `Assoc
    [ ("evaluationTree", json_of_eval_tree eval_tree)
    ; ("parameters", parameters_json)
    ; ("types", types_json) ]
