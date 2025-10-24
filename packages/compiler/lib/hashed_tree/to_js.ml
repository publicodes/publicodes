open Base
open Shared
open Shared.Eval_tree

(* Convert a Publicodes rule name to a valid snake_case JavaScript identifier *)
let rulename_to_snakecase (rule_name : Rule_name.t) : string =
  Rule_name.to_string rule_name
  |> String.substr_replace_all ~pattern:" " ~with_:"_"
  |> String.substr_replace_all ~pattern:"." ~with_:"_"
  |> String.substr_replace_all ~pattern:"'" ~with_:"_"
  |> String.substr_replace_all ~pattern:"’" ~with_:"_"
  |> String.substr_replace_all ~pattern:"-" ~with_:"_"
  |> String.substr_replace_all ~pattern:"«" ~with_:"_"
  |> String.substr_replace_all ~pattern:"»" ~with_:"_"
  |> String.substr_replace_all ~pattern:"\"" ~with_:"_"
  |> String.substr_replace_all ~pattern:"°" ~with_:"_deg"
  |> String.substr_replace_all ~pattern:"€" ~with_:"_euro"
  |> String.substr_replace_all ~pattern:"%" ~with_:"_pct"
  |> String.substr_replace_all ~pattern:"²" ~with_:"_sq"
  |> String.substr_replace_all ~pattern:"$" ~with_:"_dollar"
  |> String.uncapitalize

let binary_op_to_js : Shared.Shared_ast.binary_op -> string = function
  | Shared.Shared_ast.Add ->
      "$add"
  | Sub ->
      "$sub"
  | Mul ->
      "$mul"
  | Div ->
      "$div"
  | Pow ->
      "$pow"
  | Eq ->
      "$eq"
  | NotEq ->
      "$neq"
  | Lt ->
      "$lt"
  | Gt ->
      "$gt"
  | GtEq ->
      "$gte"
  | LtEq ->
      "$lte"
  | And ->
      "$and"
  | Or ->
      "$or"
  | Min ->
      "$min"
  | Max ->
      "$max"

let date_to_js = function
  | Eval_tree.Date (Day {day; month; year}) ->
      Printf.sprintf "new Date('%d-%02d-%02d')" year month day
  | Date (Month {month; year}) ->
      Printf.sprintf "new Date('%02d-%02d')" year month
  | _ ->
      failwith "Unsupported date format in JS conversion"

let is_lazy : Shared_ast.binary_op -> bool = function
  | And | Or | Lt | Gt | GtEq | LtEq | Pow | Div | Mul ->
      true
  | Add | Sub | Eq | NotEq | Min | Max ->
      false

let rec value_to_js ({value; _} : Tree.value) : string =
  match value with
  | Eval_tree.Const (Eval_tree.Number (n, _)) ->
      (* NOTE: maybe we should use the same logic used in [Yojson] to convert floats to strings *)
      Printf.sprintf "%.16g" n
  | Const (String s) ->
      let s =
        s
        |> String.strip ~drop:(Char.equal '\'')
        |> String.substr_replace_all ~pattern:"\"" ~with_:"\\\""
      in
      Printf.sprintf "\"%s\"" s
  | Const (Bool b) ->
      Printf.sprintf "%b" b
  | Const (Date d) ->
      date_to_js (Date d)
  | Const Null ->
      "null"
  | Const Undefined ->
      "undefined"
  | Round (mode, precision, value) ->
      let rounding_mode =
        match mode with
        | Nearest ->
            "'nearest'"
        | Up ->
            "'up'"
        | Down ->
            "'down'"
      in
      Printf.sprintf "$round(%s, %s, () => %s)" rounding_mode
        (value_to_js value) (value_to_js precision)
  | Condition (cond, then_comp, else_comp) ->
      (* FIXME: test aren't iso with the interpreter*)
      Printf.sprintf "$cond(%s, () => %s, () => %s)" (value_to_js cond)
        (value_to_js then_comp) (value_to_js else_comp)
  | Binary_op ((op, _), left, right) ->
      Printf.sprintf "%s(%s, %s %s)" (binary_op_to_js op) (value_to_js left)
        (if is_lazy op then "() => " else "")
        (value_to_js right)
  | Unary_op ((Neg, _), comp) ->
      Printf.sprintf "(- %s)" (value_to_js comp)
  | Unary_op ((Is_undef, _), comp) ->
      Printf.sprintf "(%s === undefined)" (value_to_js comp)
  | Ref rule_name ->
      Printf.sprintf "$ref(\"%s\", _%s, ctx, params)"
        (Rule_name.to_string rule_name)
        (rulename_to_snakecase rule_name)
  | Get_context rule_name ->
      Printf.sprintf "$get(\"%s\", ctx, params)"
        (Shared.Rule_name.to_string rule_name)
  | Set_context {context; value} ->
      let context_str =
        String.concat ~sep:", "
          (List.map context ~f:(fun ((rule_name, _), value) ->
               Printf.sprintf "\"%s\": %s"
                 (Shared.Rule_name.to_string rule_name)
                 (value_to_js value) ) )
      in
      Printf.sprintf "((ctx) => %s)({ ...ctx, %s })" (value_to_js value)
        context_str

let _rule_is_constant (_params : Shared.Model_outputs.t) _name rule =
  let rec needs_ctx {value; _} =
    match value with
    | Eval_tree.Ref _ | Get_context _ | Set_context _ ->
        true
    | Const _ ->
        false
    | Condition (cond, then_comp, else_comp) ->
        needs_ctx cond || needs_ctx then_comp || needs_ctx else_comp
    | Binary_op (_, left, right) ->
        needs_ctx left || needs_ctx right
    | Unary_op (_, comp) ->
        needs_ctx comp
    | Round (_, precision, value) ->
        needs_ctx precision || needs_ctx value
  in
  match rule.value with Eval_tree.Const _ -> true | _ -> not (needs_ctx rule)

let get_rule_type (tree : Tree.t) (rule_name : Rule_name.t) : string =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number (Some _)) ->
      (* TODO: manage units *)
      Printf.sprintf "number"
      (* (Stdlib.Format.asprintf "%a" Shared.Units.pp unit) *)
  | Some (Number None) ->
      "number"
  | Some (Literal String) ->
      "string"
  | Some (Literal Bool) ->
      "boolean"
  | Some (Literal Date) ->
      "Date"
  | None ->
      "null"

let parameters_to_jsdoc (tree : Tree.t) (parameters : Rule_name.t list) : string
    =
  let parameters_type =
    List.map parameters ~f:(fun rule ->
        let rule_name_str = Rule_name.to_string rule in
        let rule_type = get_rule_type tree rule in
        Printf.sprintf "\"%s\"?: Value<%s>" rule_name_str rule_type )
    |> String.concat ~sep:", "
  in
  Printf.sprintf
    {|
	/**
		@param {{%s}} [params={}]
		@param {boolean} [cache=false]
	*/|}
    parameters_type

let to_js ~(hashed_tree : Tree.t) ~outputs =
  (*
		 NOTE: for now, we are ignoring optim because it has not yet shown its benefits.
		 let hashed_tree = Optim_exprfacto.compress hashed_tree in
	*)
  let rules_str =
    Base.Hashtbl.fold hashed_tree ~init:[] ~f:(fun ~key:rule ~data acc ->
        let rule_type = get_rule_type hashed_tree rule in
        let rule_name = rulename_to_snakecase rule in
        let rule_data = value_to_js data in
        (rule_type, rule_name, rule_data) :: acc )
    |> List.sort ~compare:(fun (_, name1, _) (_, name2, _) ->
           String.compare name1 name2 )
    |> List.map ~f:(fun (rule_type, rule_name, rule_data) ->
           Printf.sprintf
             {|
	/** @type {Fn<%s>}*/
	function _%s(ctx, params) {
		return /** @type {Value<%s>} */ (%s)
	}|}
             rule_type rule_name rule_type rule_data )
    |> String.concat ~sep:"\n"
  in
  let outputs_str =
    String.concat ~sep:","
      (List.map outputs ~f:(fun Model_outputs.{rule_name; parameters; _} ->
           let rule_name_str = Rule_name.to_string rule_name in
           let rule_name_js = rulename_to_snakecase rule_name in
           let jsdoc = parameters_to_jsdoc hashed_tree parameters in
           Printf.sprintf
             {|
	%s
	"%s": (params = {}, cache = false) => $evaluate(_%s, params, cache)|}
             jsdoc rule_name_str rule_name_js ) )
  in
  let index_js =
    Printf.sprintf
      {|/** Start embedded runtime */
%s

/** End embedded runtime */

/** Compiled private Publicodes rules */

%s

/** Exported outputs/inputs */

export const rules = {
%s
}|}
      Js_runtime.runtime rules_str outputs_str
  in
  index_js
