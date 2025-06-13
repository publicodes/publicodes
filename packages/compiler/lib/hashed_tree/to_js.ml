open Core
open Shared
open Shared.Eval_tree

let binary_op_to_js : Shared.Shared_ast.binary_op -> string = function
  | Shared.Shared_ast.Add ->
      "+"
  | Shared.Shared_ast.Sub ->
      "-"
  | Shared.Shared_ast.Mul ->
      "*"
  | Shared.Shared_ast.Div ->
      "/"
  | Shared.Shared_ast.Eq ->
      "=="
  | Shared.Shared_ast.Lt ->
      "<"
  | Shared.Shared_ast.Gt ->
      ">"
  | Shared_ast.GtEq ->
      ">="
  | Shared_ast.LtEq ->
      "<="
  | Shared_ast.NotEq ->
      "!=="
  | Shared.Shared_ast.And ->
      "&&"
  | Shared.Shared_ast.Or ->
      "||"
  | Shared_ast.Pow ->
      "**"

let unary_op_to_js : Shared.Eval_tree.unary_op -> string = function
  | Shared.Eval_tree.Neg ->
      "-"
  | Shared.Eval_tree.Is_undef ->
      "undefined !=="

let date_to_js = function
  | Eval_tree.Date (Day {day; month; year}) ->
      Printf.sprintf "new Date('%d-%02d-%02d')" year month day
  | Eval_tree.Date (Month {month; year}) ->
      Printf.sprintf "new Date('%02d-%02d')" year month
  | _ ->
      failwith "Unsupported date format in JS conversion"

(* Convert a value to a JS expression. This is a simplified version that does not
	 handle all cases, but should be enough for the current use case. *)

let rec value_to_js ({value; _} : Typed_tree.value) : string =
  match value with
  | Eval_tree.Const (Eval_tree.Number (n, _)) ->
      Printf.sprintf "%f" n
  | Eval_tree.Const (Eval_tree.String s) ->
      Printf.sprintf "'%s'" (String.escaped s)
  | Eval_tree.Const (Eval_tree.Bool b) ->
      Printf.sprintf "%b" b
  | Eval_tree.Const (Eval_tree.Date d) ->
      date_to_js (Eval_tree.Date d)
  | Eval_tree.Const Eval_tree.Null ->
      "null"
  | Eval_tree.Const Eval_tree.Undefined ->
      "undefined"
  | Eval_tree.Condition (cond, then_comp, else_comp) ->
      Printf.sprintf "(%s ? %s : %s)" (value_to_js cond) (value_to_js then_comp)
        (value_to_js else_comp)
  | Eval_tree.Binary_op ((op, _), left, right) ->
      Printf.sprintf "(%s %s %s)" (value_to_js left) (binary_op_to_js op)
        (value_to_js right)
  | Eval_tree.Unary_op ((op, _), comp) ->
      Printf.sprintf "(%s %s)" (unary_op_to_js op) (value_to_js comp)
  | Eval_tree.Ref rule_name ->
      Printf.sprintf "rules[\"%s\"](ctx)" (Shared.Rule_name.to_string rule_name)
  | Eval_tree.Get_context rule_name ->
      Printf.sprintf "ctx[\"%s\"]" (Shared.Rule_name.to_string rule_name)
  | Eval_tree.Set_context {context; value} ->
      let context_str =
        String.concat ~sep:", "
          (List.map context ~f:(fun ((rule_name, _), value) ->
               Printf.sprintf "'%s': %s"
                 (Shared.Rule_name.to_string rule_name)
                 (value_to_js value) ) )
      in
      Printf.sprintf "rules[\"%s\"]({ ...ctx, %s })" (value_to_js value)
        context_str

let _params_to_js (rule_name : string) (params : Shared.Parameters.t) : string =
  let params =
    List.find params ~f:(fun (name, _) ->
        String.equal (Shared.Rule_name.to_string name) rule_name )
  in
  match params with
  | None ->
      ""
  | Some (_, params) ->
      let params_str =
        String.concat ~sep:", "
          (List.map params ~f:(fun rule_name ->
               Printf.sprintf "\"%s\": any"
                 (Shared.Rule_name.to_string rule_name) ) )
      in
      Printf.sprintf "ctx: { %s }" params_str

let to_js tree _params =
  let rules =
    Core.Hashtbl.fold tree ~init:[] ~f:(fun ~key:rule ~data acc ->
        let rule_name = Shared.Rule_name.to_string rule in
        let rule_data = value_to_js data in
        (rule_name, rule_data) :: acc )
  in
  let rules_str =
    String.concat ~sep:",\n"
      (List.map rules ~f:(fun (rule_name, rule_data) ->
           (* let params_str = params_to_js rule_name params in *)
           Printf.sprintf "\"%s\": (ctx) => {\nreturn %s\n}"
             rule_name (* params_str *)
             rule_data ) )
  in
  Printf.sprintf "const rules = {\n%s\n};\n" rules_str
