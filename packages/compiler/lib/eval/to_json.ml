open Common
open Core

let to_json (eval_tree : Ast.t) (rules : Dotted_name.Set.t) =
  (* Convert a dotted name to string representation *)
  let dotted_name_to_string name = String.concat ~sep:" . " name in

  (* Recursively convert a computation to JSON *)
  let rec computation_to_json = function
    | Ast.Const c ->
        let const =
          match c with
          | Number n -> [ ("type", `String "number"); ("value", `Float n) ]
          | Bool b -> [ ("type", `String "boolean"); ("value", `Bool b) ]
          | String s -> [ ("type", `String "string"); ("value", `String s) ]
          | Date (Day { day; month; year }) ->
              [
                ("type", `String "date");
                ("value", `String (Printf.sprintf "%d-%02d-%02d" year month day));
              ]
          | Date (Month { month; year }) ->
              [
                ("type", `String "month");
                ("value", `String (Printf.sprintf "%02d-%02d" year month));
              ]
          | Undefined -> [ ("type", `String "undefined"); ("value", `Null) ]
          | Null -> [ ("type", `String "null"); ("value", `Null) ]
        in
        `Assoc (("kind", `String "constant") :: const)
    | Ref name ->
        `Assoc
          [
            ("kind", `String "ref");
            ("value", `String (dotted_name_to_string name));
          ]
    | Condition (cond, then_expr, else_expr) ->
        `Assoc
          [
            ("kind", `String "condition");
            ("if", computation_to_json cond);
            ("then", computation_to_json then_expr);
            ("else", computation_to_json else_expr);
          ]
    | BinaryOp (op, left, right) ->
        let op_str =
          match op with
          | Add -> "+"
          | Sub -> "-"
          | Mul -> "*"
          | Div -> "/"
          | Pow -> "^"
          | Gt -> ">"
          | Lt -> "<"
          | GtEq -> ">="
          | LtEq -> "<="
          | Eq -> "="
          | NotEq -> "!="
        in
        `Assoc
          [
            ("kind", `String "binary_op");
            ("op", `String op_str);
            ("left", computation_to_json left);
            ("right", computation_to_json right);
          ]
    | UnaryOp (op, expr) ->
        let op_str = match op with Neg -> "-" in
        `Assoc
          [
            ("kind", `String "unary_op");
            ("op", `String op_str);
            ("expr", computation_to_json expr);
          ]
  in

  (* Build the JSON object by iterating through the rules *)
  let json_assoc =
    Set.fold rules ~init:[] ~f:(fun acc rule ->
        match Hashtbl.find eval_tree rule with
        | Some computation ->
            (dotted_name_to_string rule, computation_to_json computation) :: acc
        | None -> acc)
  in

  `Assoc json_assoc
