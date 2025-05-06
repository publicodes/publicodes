open Core
open Common
open Ast

let to_json ~(rule_names : Rule_name.Set.t) (eval_tree : Ast.t) =
  (* Convert a dotted name to string representation *)
  (* Recursively convert a computation to JSON *)
  let rec computation_to_json = function
    | Ast.Const c -> (
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
    | Ref name ->
        `String (Rule_name.to_string name)
    | Condition (cond, then_expr, else_expr) ->
        `Assoc
          [ ("if", computation_to_json cond)
          ; ("then", computation_to_json then_expr)
          ; ("else", computation_to_json else_expr) ]
    | BinaryOp (op, left, right) ->
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
        in
        `List
          [computation_to_json left; `String op_str; computation_to_json right]
    | UnaryOp (op, expr) ->
        let op_str = match op with Neg -> "-" in
        `List [`String op_str; computation_to_json expr]
  in
  (* Build the JSON object by iterating through the rules *)
  let json_assoc =
    Set.fold rule_names ~init:[] ~f:(fun acc rule ->
        match Hashtbl.find eval_tree rule with
        | Some computation ->
            (Rule_name.to_string rule, computation_to_json computation) :: acc
        | None ->
            acc )
  in
  `Assoc json_assoc
