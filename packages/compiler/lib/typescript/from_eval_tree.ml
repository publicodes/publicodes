open Core
open Eval.Tree

let to_json (eval_tree : Eval.Tree.t) =
  (* Convert a dotted name to string representation *)
  (* Recursively convert a computation to JSON *)
  let rec computation_to_json ((eval_tree, _) : computation) =
    match eval_tree with
    | Ref name ->
        `String (Shared.Rule_name.to_string name)
    | Const c -> (
      match c with
      | Number n ->
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
    | BinaryOp ((op, _), left, right) ->
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
        `List
          [computation_to_json left; `String op_str; computation_to_json right]
    | UnaryOp ((op, _), expr) ->
        let op_str = match op with Neg -> "-" in
        `List [`String op_str; computation_to_json expr]
  in
  (* Build the JSON object by iterating through the rules *)
  let json_assoc =
    Hashtbl.fold eval_tree ~init:[] ~f:(fun ~key:rule ~data acc ->
        (Shared.Rule_name.to_string rule, computation_to_json data) :: acc )
  in
  `Assoc json_assoc
