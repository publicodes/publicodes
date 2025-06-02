open Core
open Utils
open Shared.Eval_tree
open Shared.Rule_name
open Tree

let rec value_to_json (tree : value) =
  match tree.value with
  | Get_context name ->
      `Assoc [("get", `String (to_string name))]
  | Set_context {context; value} ->
      let context =
        List.map context ~f:(fun (rule_name, value) ->
            (to_string (Pos.value rule_name), value_to_json value) )
      in
      let value = value_to_json value in
      `Assoc [("value", value); ("context", `Assoc context)]
  | Ref name ->
      `String (to_string name)
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
        [ ("if", value_to_json cond)
        ; ("then", value_to_json then_expr)
        ; ("else", value_to_json else_expr) ]
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
      `List [value_to_json left; `String op_str; value_to_json right]
  | Unary_op ((op, _), expr) ->
      let op_str = match op with Neg -> "-" | Is_undef -> "∅" in
      `List [`String op_str; value_to_json expr]

let json_of_eval_tree (tree : Tree.t) =
  (* Convert a dotted name to string representation *)
  (* Recursively convert a computation to JSON *)

  (* Build the JSON object by iterating through the rules *)
  let json_assoc =
    Core.Hashtbl.fold tree ~init:[] ~f:(fun ~key:rule ~data acc ->
        (to_string rule, value_to_json data) :: acc )
  in
  `Assoc json_assoc

let to_json tree params =
  let parameters_json =
    `Assoc
      (List.map params ~f:(fun (key, value) ->
           ( to_string key
           , `Assoc (List.map value ~f:(fun rule -> (to_string rule, `Null))) ) )
      )
  in
  let types_json =
    `Assoc
      (List.map params ~f:(fun (key, _) ->
           ( to_string key
           , let open Shared.Typ in
             match (get_meta tree key).typ with
             | Some (Number (Some unit)) ->
                 `Assoc
                   [ ("number", `Null)
                   ; ( "unit"
                     , `String (Format.asprintf "%a" Shared.Units.pp unit) ) ]
             | Some (Number None) ->
                 `Assoc [("number", `Null)]
             | Some (Literal String) ->
                 `Assoc [("string", `Null)]
             | Some (Literal Bool) ->
                 `Assoc [("boolean", `Null)]
             | Some (Literal Date) ->
                 `Assoc [("date", `Null)]
             | None ->
                 `Null ) ) )
  in
  `Assoc
    [ ("evaluationTree", json_of_eval_tree tree)
    ; ("parameters", parameters_json)
    ; ("types", types_json) ]
