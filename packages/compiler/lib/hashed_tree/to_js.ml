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
      (* FIXME: should be consistant *)
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

let params_to_d_ts (tree : Tree.t) (outputs : Shared.Model_outputs.t) : string =
  List.map outputs ~f:(fun {rule_name; parameters; _} ->
      let rule_str = Rule_name.to_string rule_name in
      let parameters =
        List.map parameters ~f:(fun rule ->
            Printf.sprintf "\"%s\": null" (Rule_name.to_string rule) )
        |> String.concat ~sep:", "
      in
      let type_info =
        let open Shared.Typ in
        let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
        match typ with
        | Some (Number (Some unit)) ->
            Printf.sprintf "{ type: number, unit: \"%s\" }"
              (Stdlib.Format.asprintf "%a" Shared.Units.pp unit)
        | Some (Number None) ->
            "{ type: number }"
        | Some (Literal String) ->
            "{ type: string }"
        | Some (Literal Bool) ->
            "{ type: boolean }"
        | Some (Literal Date) ->
            "{ type: Date }"
        | None ->
            "{ type = null}"
      in
      Printf.sprintf "\"%s\": { value: %s, parameters: { %s } }" rule_str
        type_info parameters )
  |> String.concat ~sep:",\n"

let to_js ~(hashed_tree : Tree.t) ~outputs =
  let hashed_tree = Optim_exprfacto.compress hashed_tree in
  let rules =
    Base.Hashtbl.fold hashed_tree ~init:[] ~f:(fun ~key:rule ~data acc ->
        let rule_name = rulename_to_snakecase rule in
        let rule_data =
          (* ( if rule_is_constant outputs rule data then Printf.sprintf "%s" *)
          (*   else Printf.sprintf "(ctx) => %s" ) *)
          value_to_js data
        in
        (rule_name, rule_data) :: acc )
    |> List.sort ~compare:(fun (name1, _) (name2, _) ->
           String.compare name1 name2 )
  in
  let rules_str =
    String.concat ~sep:"\n\n"
      (List.map rules ~f:(fun (rule_name, rule_data) ->
           (* let params_str = params_to_js rule_name params in *)
           Printf.sprintf "function _%s(ctx, params) {\n  return %s \n}"
             rule_name (* params_str *) rule_data ) )
  in
  (* let _outputs_str = *)
  (*   `Assoc (Outputs_to_json.outputs_to_json outputs) *)
  (*   |> Yojson.Safe.pretty_to_string *)
  (* in *)
  let outputs_str =
    String.concat ~sep:",\n"
      (List.map outputs ~f:(fun Model_outputs.{rule_name; _} ->
           let rule_js_name = rulename_to_snakecase rule_name in
           Printf.sprintf "\"%s\": (params = {}) => $evaluate(_%s, params)"
             (Rule_name.to_string rule_name)
             rule_js_name ) )
  in
  let index_js =
    Printf.sprintf
      {|

/** Start embedded runtime */

%s

/** End embedded runtime */

/** Compiled Publicodes rules */

%s

/** Exported functions */

export const rules = {
%s
}
|}
      Js_runtime.runtime rules_str outputs_str
  in
  let index_d_ts =
    Printf.sprintf
      {|
export default class Engine {
	constructor(cache?: boolean)
	evaluate<R extends Inputs>(
		rule: R,
		context: Partial<{
			[K in keyof Context[R]['parameters'] &
				Inputs]: Context[K]['value']['type']
		}>,
	): Evaluation<R>
}

export type Inputs = keyof Context

export type Parameters<R extends Inputs> = keyof Context[R]['parameters']

export type Evaluation<R extends Inputs> = {
	value: Context[R]['value']['type'] | undefined | null
	traversedParameters: Parameters<R>[]
	missingParameters: Parameters<R>[]
}

export type Context = { %s }|}
      (params_to_d_ts hashed_tree outputs)
  in
  (index_js, index_d_ts)
