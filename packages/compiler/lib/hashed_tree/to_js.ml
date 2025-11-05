open Base
open Shared
open Shared.Eval_tree

(* -------------------- Helper functions for names and types -------------------- *)

(* Convert a Publicodes rule name to a valid snake_case JavaScript identifier *)
(* @TODO : handle conflicts (e.g « a'a » and « a a » ) *)
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

(* Convert a rule name to a valid TypeScript type name *)
let rulename_to_type_name (rule_name : Rule_name.t) : string =
  let capitalized = String.capitalize (rulename_to_snakecase rule_name) in
  Printf.sprintf "%sParams" capitalized

(* -------------------- JSDoc Type Generation -------------------- *)

(* Get the unit of a rule *)
let get_rule_unit (tree : Tree.t) (rule_name : Rule_name.t) : string option =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number (Some unit)) ->
      Some (Stdlib.Format.asprintf "%a" Shared.Units.pp unit)
  | _ ->
      None

(* Get the JavaScript type for a Publicodes type *)
let get_js_rule_type (tree : Tree.t) (rule_name : Rule_name.t) : string =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number _) ->
      "number"
  | Some (Literal String) ->
      "string"
  | Some (Literal Bool) ->
      "boolean"
  | Some (Literal Date) ->
      "Date"
  | None ->
      "unknown"

(* Get the output type string *)
let get_publicodes_rule_type (tree : Tree.t) (rule_name : Rule_name.t) : string
    =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number _) ->
      "number"
  | Some (Literal String) ->
      "text"
  | Some (Literal Bool) ->
      "boolean"
  | Some (Literal Date) ->
      "date"
  | None ->
      ""

(* Generate JSDoc parameter type definition *)
let generate_params_typedef (tree : Tree.t) (rule_name : Rule_name.t)
    (parameters : Rule_name.t list) : string =
  let type_name = rulename_to_type_name rule_name in
  let parameters_type =
    List.map parameters ~f:(fun param ->
        let param_name = Rule_name.to_string param in
        let param_type = get_js_rule_type tree param in
        Printf.sprintf "'%s'?: %s | undefined" param_name param_type )
    |> String.concat ~sep:";\n\t\t\t\t"
  in
  Printf.sprintf
    {|/**
		 * Parameters of "%s"
		 * @typedef {{
				%s
			}} %s
		 */|}
    (Rule_name.to_string rule_name)
    parameters_type type_name

(* Generate JSDoc for evaluate function *)
let generate_evaluate_jsdoc (tree : Tree.t) (rule_name : Rule_name.t) : string =
  let return_type = get_js_rule_type tree rule_name in
  let type_name = rulename_to_type_name rule_name in
  Printf.sprintf
    {|/**
		 * Evaluate "%s"
		 * @param {%s} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {%s | undefined | null}
		 */|}
    (Rule_name.to_string rule_name)
    type_name return_type

let generate_evaluate_params_jsdoc (tree : Tree.t) (rule_name : Rule_name.t) :
    string =
  let return_type = get_js_rule_type tree rule_name in
  let type_name = rulename_to_type_name rule_name in
  Printf.sprintf
    {|/**
		 * Evaluate "%s" with information on missing and needed parameters
		 * @param {%s} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: %s | undefined | null; needed: Array<keyof %s>, missing: Array<keyof %s> }}
		 */|}
    (Rule_name.to_string rule_name)
    type_name return_type type_name type_name

(* -------------------- JavaScript Code Generation -------------------- *)

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
      Printf.sprintf "$get(\"%s\", ctx, params)" (Rule_name.to_string rule_name)
  | Set_context {context; value} ->
      let context_str =
        String.concat ~sep:", "
          (List.map context ~f:(fun ((rule_name, _), value) ->
               Printf.sprintf "\"%s\": %s"
                 (Rule_name.to_string rule_name)
                 (value_to_js value) ) )
      in
      Printf.sprintf "((ctx) => %s)({ ...ctx, %s })" (value_to_js value)
        context_str

(* -------------------- Main Code Generation Functions -------------------- *)

let rules_to_js_functions hashed_tree =
  Base.Hashtbl.fold hashed_tree ~init:[] ~f:(fun ~key:rule ~data acc ->
      let rule_type = get_js_rule_type hashed_tree rule in
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
		return /** @type {%s} */ (%s)
	}|}
           rule_type rule_name rule_type rule_data )
  |> String.concat ~sep:"\n"

let to_js_str str =
  let js_str =
    str
    |> Base.String.substr_replace_all ~pattern:"'" ~with_:"\\'"
    |> Base.String.substr_replace_all ~pattern:"\n" ~with_:"\\n"
    |> Base.String.substr_replace_all ~pattern:"\t" ~with_:"\\t"
  in
  Printf.sprintf "'%s'" js_str

(* Generate a single rule object *)
let generate_rule_object hashed_tree
    Model_outputs.{rule_name; parameters; meta; _} =
  let publicodes_rule_type = get_publicodes_rule_type hashed_tree rule_name in
  let rule_name_str = Rule_name.to_string rule_name in
  let rule_name_js = rulename_to_snakecase rule_name in
  let type_name = rulename_to_type_name rule_name in
  (* Generate TypeDef for parameters *)
  let params_typedef =
    generate_params_typedef hashed_tree rule_name parameters
  in
  (* Generate evaluate function JSDoc *)
  let evaluate_jsdoc = generate_evaluate_jsdoc hashed_tree rule_name in
  let evaluate_params_jsdoc =
    generate_evaluate_params_jsdoc hashed_tree rule_name
  in
  let title_property =
    let title =
      List.find_map meta ~f:(fun meta ->
          match meta with Title title -> Some title | _ -> None )
      |> Option.value ~default:rule_name_str
    in
    Printf.sprintf {|
		/** @type {string} %s */
		title: %s,|} title
      (to_js_str title)
  in
  let description_property =
    List.find_map meta ~f:(fun meta ->
        match meta with
        | Description desc ->
            Some
              (Printf.sprintf {|
		/** @type {string} %s */
		description: %s,|}
                 desc (to_js_str desc) )
        | _ ->
            None )
    |> Option.value ~default:""
  in
  let note_property =
    List.find_map meta ~f:(fun meta ->
        match meta with
        | Note note ->
            Some
              (Printf.sprintf {|
		/** @type {string} %s */
		note: %s,|} note
                 (to_js_str note) )
        | _ ->
            None )
    |> Option.value ~default:""
  in
  (* Generate parameters list *)
  let params_list =
    Printf.sprintf "[%s]"
      (String.concat ~sep:", "
         (List.map parameters ~f:(fun p -> to_js_str (Rule_name.to_string p))) )
  in
  (* Generate unit property if present *)
  let unit_property =
    match get_rule_unit hashed_tree rule_name with
    | Some unit ->
        Printf.sprintf {|
		/** @type {"%s"} */
		unit: "%s",|} unit unit
    | None ->
        ""
  in
  let meta_property =
    List.find_map meta ~f:(fun meta ->
        match meta with
        | Custom_meta meta ->
            Some
              (Printf.sprintf
                 {|
		/** Custom meta of rule "%s" */
		meta: %s /** @type {const} */,|}
                 rule_name_str
                 (Yojson.Safe.to_string meta) )
        | _ ->
            None )
    |> Option.value ~default:""
  in
  Printf.sprintf
    {|%s: {
		%s
		%s
		evaluate: (params = {}, options) => $evaluate(_%s, params, options).value,
		%s
		evaluateParams: (params = {}, options) => $evaluate(_%s, params, options),
		/** @type {"%s"} */
		type: "%s",%s
		/** Parameter list for "%s"
		 * @type {Array<keyof %s>}
		 */
		params: %s,%s%s%s%s
	}|}
    (to_js_str rule_name_str) params_typedef evaluate_jsdoc rule_name_js
    evaluate_params_jsdoc rule_name_js publicodes_rule_type publicodes_rule_type
    unit_property rule_name_str type_name params_list title_property
    description_property note_property meta_property

let outputs_to_js_rules hashed_tree outputs =
  List.map outputs ~f:(generate_rule_object hashed_tree)
  |> String.concat ~sep:",\n"

(* Split final output generation into smaller parts *)
let generate_header runtime =
  Printf.sprintf
    {|/** Start embedded runtime */
%s

/** End embedded runtime */|} runtime

let generate_private_rules rules_str =
  Printf.sprintf {|/** Compiled private Publicodes rules */

%s|} rules_str

let generate_exports outputs_str =
  Printf.sprintf
    {|/** Exported outputs/inputs */

const rules = {
%s
}

export default rules;|}
    outputs_str

let to_js tree outputs =
  let rules_str = rules_to_js_functions tree in
  let outputs_str = outputs_to_js_rules tree outputs in
  String.concat ~sep:"\n\n"
    [ generate_header Js_runtime.runtime
    ; generate_private_rules rules_str
    ; generate_exports outputs_str ]
