open Base
open Shared
open Shared.Eval_tree

let binary_op_to_js : Shared.Shared_ast.binary_op -> string = function
  | Shared.Shared_ast.Add ->
      "add"
  | Sub ->
      "sub"
  | Mul ->
      "mul"
  | Div ->
      "div"
  | Pow ->
      "pow"
  | Eq ->
      "eq"
  | NotEq ->
      "neq"
  | Lt ->
      "lt"
  | Gt ->
      "gt"
  | GtEq ->
      "gte"
  | LtEq ->
      "lte"
  | And ->
      "and"
  | Or ->
      "or"
  | Min ->
      "min"
  | Max ->
      "max"

let date_to_js = function
  | Eval_tree.Date (Day {day; month; year}) ->
      Printf.sprintf "new Date('%d-%02d-%02d')" year month day
  | Eval_tree.Date (Month {month; year}) ->
      Printf.sprintf "new Date('%02d-%02d')" year month
  | _ ->
      failwith "Unsupported date format in JS conversion"

let rec value_to_js ({value; _} : Tree.value) : string =
  match value with
  | Eval_tree.Const (Eval_tree.Number (n, _)) ->
      (* NOTE: maybe we should use the same logic used in [Yojson] to convert floats to strings *)
      Printf.sprintf "%.16g" n
  | Const (String s) ->
      (* FIXME: should be consistant *)
      let s = String.strip ~drop:(Char.equal '\'') s in
      Printf.sprintf "'%s'" s
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
      Printf.sprintf "round(%s, %s, () => %s)" rounding_mode (value_to_js value)
        (value_to_js precision)
  | Condition (cond, then_comp, else_comp) ->
      (* FIXME: test aren't iso with the interpreter*)
      Printf.sprintf "cond(%s, () => %s, () => %s)" (value_to_js cond)
        (value_to_js then_comp) (value_to_js else_comp)
  | Binary_op ((op, _), left, right) ->
      Printf.sprintf "%s(%s, () => %s)" (binary_op_to_js op) (value_to_js left)
        (value_to_js right)
  | Unary_op ((Neg, _), comp) ->
      Printf.sprintf "(- %s)" (value_to_js comp)
  | Unary_op ((Is_undef, _), comp) ->
      Printf.sprintf "(%s === undefined)" (value_to_js comp)
  | Ref rule_name ->
      Printf.sprintf "this.ref(\"%s\", ctx)" (Rule_name.to_string rule_name)
  | Get_context rule_name ->
      Printf.sprintf "this.get(\"%s\", ctx)"
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

let rule_is_constant (_params : Shared.Model_outputs.t) _name rule =
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

let to_js ~(eval_tree : Tree.t) ~outputs =
  let rules =
    Base.Hashtbl.fold eval_tree ~init:[] ~f:(fun ~key:rule ~data acc ->
        let rule_name = Shared.Rule_name.to_string rule in
        let rule_data =
          ( if rule_is_constant outputs rule data then Printf.sprintf "%s"
            else Printf.sprintf "(ctx) => %s" )
            (value_to_js data)
        in
        (rule_name, rule_data) :: acc )
  in
  let rules_str =
    String.concat ~sep:",\n"
      (List.map rules ~f:(fun (rule_name, rule_data) ->
           (* let params_str = params_to_js rule_name params in *)
           Printf.sprintf "\"%s\": %s" rule_name (* params_str *) rule_data ) )
  in
  let outputs_str =
    `Assoc (Outputs_to_json.outputs_to_json outputs)
    |> Yojson.Safe.pretty_to_string
  in
  let index_js =
    Printf.sprintf
      {|
/**
 * @typedef {date | number | string | null | undefined} Value
 * @typedef {number | null | undefined} Number
 * @typedef {boolean | null | undefined} Boolean
 * @typedef {() => Number} LazyNumber
 * @typedef {() => Boolean} LazyBoolean
 * @typedef {() => Value} LazyValue
 */

/**
 * TODO:
 * - Test with an eager value for the left operand.
 * - How to provide better information about the error (eg. rule name,
 *   operation, etc...)?
 * - Some function are factorizable, do we want to?
 * - How do we want to handle non boolean values in OR and AND operations? By
 *   checking if they are defined or not?
 * - Do we want to accept other types than numbers for the negation operation?
 * - Don't use lazy values if it's a constant value?
 *
 * NOTE:
 * - for multiplication, if the value is null (i.e not applicable), does it make
 *   sense to return 0?
 * - instead of using `?? 0` each time, we could use a wraping function or class
 *   to modelize the number. However, this could be an overhead for simple
 *   operations.
 * - `null` as `0` even in power, multiplication, and division?
 * - do we want to directly use `undefined` and `null` or use dedicated values?
 *   (linked to the second point)
 * - for now, dates are compared using the JS polymorphic variant of the
 *   operator. However, if we choose to continue with the JS approach,
 *   we should use https://github.com/CatalaLang/dates-calc.
 *
 * FIXME:
 * - In the current `evaluateNode` implementation, the `null` value in the right
 *   operand of the `LazyNullOps` aren't handled correctly. The following
 *   property is not satisfied: ∀ x, op. op(x, null) = op(null, x) = null
 * - In the actual implementation (Publicodes 1), the `null` value is not
 *   commutative in the `LazyNullOps` operations.
 *   null * 0 = null and 0 * null = 0
 */

/** Error handling */

class RuntimeError extends Error {
	/**
	 * @param {string} message
	 */
	constructor(message) {
		super(message)
		this.name = 'RuntimeError'
	}
}

/** Basic numeric operations */

/**
 * @param {Number} left
 * @param {LazyNumber} right
 * @returns {number | undefined}
 *
 * @specification
 * The addition operation is defined as follows by order of precedence:
 * 1. ∀ x. add(undefined, x) = add(x, undefined) = undefined
 * 2. ∀ x. add(x, null) = add(null, x) = x
 * 3. ∀ x. add(null, null) = 0
 * 4. ∀ x, y. add(x, y) = x + y
 */
function add(l, right) {
	if (l === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return (l ?? 0) + (r ?? 0)
}

/**
 * @param {Number} left
 * @param {LazyNumber} right
 * @returns {number | undefined}
 *
 * @specification
 * The subtraction operation is defined as follows by order of precedence:
 * 1. ∀ x. sub(undefined, x) = sub(x, undefined) = undefined
 * 2. ∀ x. sub(null, null) = 0
 * 3. ∀ x. sub(x, null) = x
 * 4. ∀ x. sub(null, x) = -x
 * 5. ∀ x, y. sub(x, y) = x - y
 */
function sub(l, right) {
	if (l === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return (l ?? 0) - (r ?? 0)
}

/**
 * @param {Number} left
 * @param {LazyNumber} right
 * @returns {number | null | undefined}
 *
 * @specification
 * The multiplication operation is defined as follows by order of precedence:
 * 1. ∀ x. mul(0, x) = mul(x, 0) = 0
 * 2. ∀ x. mul(undefined, x) = mul(x, undefined) = undefined
 * 3. ∀ x. mul(null, x) = mul(x, null) = null
 */
function mul(l, right) {
	if (l === 0) {
		return 0
	}

	const r = right()
	if (l === undefined) {
		return r === 0 ? 0 : undefined
	}

	return (
		r === undefined ? undefined
		: l === null || r === null ? null
		: l * r
	)
}

/**
 * @param {Number} left
 * @param {LazyNumber} right
 * @returns {number | null | undefined}
 *
 * @throws {RuntimeError} if the right operand is evaluated to zero.
 *
 * @specification
 * The division operation is defined as follows by order of precedence:
 * 1. ∀ x. div(0, x) = 0
 * 2. ∀ x. div(x, 0) = throw RuntimeError('Division by zero')
 * 3. ∀ x. div(undefined, x) = div(x, undefined) = undefined
 * 4. ∀ x. div(null, x) = div(x, null) = null
 * 5. ∀ x, y. div(x, y) = x / y
 */
function div(l, right) {
	if (l === 0) {
		return 0
	}

	const r = right()
	if (l === undefined) {
		if (r === 0) {
			// TODO: improve information provided in the error
			throw new RuntimeError('Division by zero')
		}
		return undefined
	}

	return (
		r === undefined ? undefined
		: l === null || r === null ? null
		: l / r
	)
}

/**
 * @param {Number} left
 * @param {LazyNumber} right
 * @returns {number | undefined}
 *
 * @specification
 * The power operation is defined as follows by order of precedence:
 * 1. ∀ x. pow(0, x) = 0
 * 2. ∀ x. pow(x, 0) = 1
 * 3. ∀ x. pow(undefined, y) = pow(x, undefined) = undefined
 * 4. ∀ x. pow(x, null) = pow(null, x) = null
 * 5. ∀ x, y. pow(x, y) = x ** y
 */
function pow(l, right) {
	if (l === 0) {
		return 0
	}

	const r = right()
	if (l === undefined) {
		return r === 0 ? 1 : undefined
	}

	return (
		r === undefined ? undefined
		: l === null || r === null ? null
		: l ** r
	)
}

/** Basic boolean operations */

/**
 * @param {Value} left
 * @param {LazyValue} right
 * @returns {boolean | undefined}
 *
 * @specification
 * The equality operation is defined as follows by order of precedence:
 * 1. ∀ x. eq(undefined, x) = eq(x, undefined) = undefined
 * 2. ∀ x, y. eq(x, y) = x === y
 */
function eq(l, right) {
	if (l === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return l === r
}

/**
 * @param {Value} left
 * @param {LazyValue} right
 * @returns {boolean | undefined}
 *
 * @specification
 * The inequality operation is defined as follows by order of precedence:
 * 1. ∀ x. neq(undefined, x) = neq(x, undefined) = undefined
 * 2. ∀ x, y. neq(x, y) = x !== y
 */
function neq(l, right) {
	if (l === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return l !== r
}

/**
 * @param {Value} left
 * @param {LazyValue} right
 * @returns {boolean | null | undefined}
 *
 * @specification
 * The less than operation is defined as follows by order of precedence:
 * 1. ∀ x. lt(undefined, x) = lt(x, undefined) = undefined
 * 2. ∀ x. lt(null, x) = lt(x, null) = null
 * 3. ∀ x, y. lt(x, y) = x < y
 */
function lt(l, right) {
	if (l === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return l === null || r === null ? null : l < r
}

/**
 * @param {Value} left
 * @param {LazyValue} right
 * @returns {boolean | null | undefined}
 *
 * @specification
 * The greater than operation is defined as follows by order of precedence:
 * 1. ∀ x. gt(undefined, x) = gt(x, undefined) = undefined
 * 2. ∀ x. gt(null, x) = gt(x, null) = null
 * 3. ∀ x, y. lt(x, y) = x > y
 */
function gt(l, right) {
	if (l === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return l === null || r === null ? null : l > r
}

/**
 * @param {Value} left
 * @param {LazyValue} right
 * @returns {boolean | null | undefined}
 *
 * @specification
 * The less than or equal is defined as follows by order of precedence:
 * 1. ∀ x. lte(undefined, x) = lte(x, undefined) = undefined
 * 2. ∀ x. lte(null, x) = lte(x, null) = null
 * 3. ∀ x, y. lte(x, y) = x <= y
 */
function lte(l, right) {
	if (l === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return l === null || r === null ? null : l <= r
}

/**
 * @param {Value} left
 * @param {LazyValue} right
 * @returns {boolean | null | undefined}
 *
 * @specification
 * The greater than or equal is defined as follows by order of precedence:
 * 1. ∀ x. gte(undefined, x) = gte(x, undefined) = undefined
 * 2. ∀ x. gte(null, x) = gte(x, null) = null
 * 3. ∀ x, y. gte(x, y) = x <= y
 */
function gte(l, right) {
	if (l === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return l === null || r === null ? null : l >= r
}

/**
 * @param {Boolean} left
 * @param {LazyBoolean} right
 * @returns {boolean | undefined}
 *
 * @specification
 * The logical AND operation is defined as follows by order of precedence:
 * 1. ∀ x. and(undefined, x) = and(x, undefined) = undefined
 * 2. ∀ x. and(null, x) = and(x, null) = false
 * 3. ∀ x, y. and(x, y) = x && y
 */
function and(l, right) {
	if (l === undefined) {
		return undefined
	}

	if (l === null || l === false) {
		return false
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return l === null || r === null ? false : l && r
}

/**
 * @param {Boolean} left
 * @param {LazyBoolean} right
 * @returns {boolean | undefined}
 *
 * @specification
 * The logical OR operation is defined as follows by order of precedence:
 * 1. ∀ x. or(undefined, x) = or(x, undefined) = undefined
 * 2. ∀ x. or(null, null) = false
 * 3. ∀ x. or(null, x) = or(x, null) = x
 * 4. ∀ x, y. or(x, y) = x || y
 */
function or(l, right) {
	if (l === undefined) {
		return undefined
	}

	if (l === true) {
		return true
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return l || r
}

/** Unary operations */

/**
 * @param {number | null | undefined} operand
 * @returns {number | undefined}
 * @specification
 * The unary negation operation is defined as follows by order of precedence:
 * 1. ∀ x. neg(undefined) = undefined
 * 2. ∀ x. neg(null) = 0
 * 3. ∀ x. neg(x) = -x
 */
function neg(val) {
	if (val === undefined) {
		return undefined
	}

	return val === null ? 0 : -val
}

/**
 * @param {'up' | 'down' | 'nearest'} mode
 * @param {Number} val
 * @param {LazyNumber} precision
 * @returns {number | null | undefined}
 *
 * @throws {RuntimeError} if the precision is negative, equals to zero or not an integer.
 *
 * @specification
 * The rounding operation is defined as follows by order of precedence:
 * - ∀ x. round(mode, undefined, precision) = undefined
 * - ∀ x. round(mode, null, precision) = null
 * - ∀ x. round(mode, x, undefined) = undefined
 * - ∀ x. round(mode, x, null) = x
 * - ∀ x, p. round(mode, x, p) = rounded value of x with the given mode and precision p
 *    - if mode = 'up', round towards the nearest multiple of p greater than or equal to x
 *    - if mode = 'down', round towards the nearest multiple of p less than or equal to x
 *    - if mode = 'nearest', round to the nearest multiple of p
 */
function round(mode, val, precision) {
	if (val === undefined) {
		return undefined
	}
	if (val === null) {
		return null
	}

	const p = precision()
	if (p === undefined) {
		return undefined
	}

	if (p === null) {
		return val
	}

	if (p <= 0) {
		throw new RuntimeError('p must be a positive integer')
	}

	const r = (num) =>
		// Use 15 precision for floating number in JS https://stackoverflow.com/a/3644302
		Number(num.toPrecision(15))

  return r(
    mode === "up"
      ? Math.ceil(r(val / p)) * p
      : mode === "down"
        ? Math.floor(r(val / p)) * p
        : Math.round(r(val / p)) * p,
  );
}

function min(left, right) {
	if (left === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	if (left === null || r === null) {
		return left === null ? r : left
	}

	return left < r ? left : r
}

function max(left, right) {
	if (left === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	if (left === null || r === null) {
		return left === null ? r : left
	}

	return left > r ? left : r
}

/**
 * @param {Boolean} c
 * @param {LazyValue} ifTrue
 * @param {LazyValue} ifFalse
 * @returns {Value | undefined}
 *
 * @specification
 * The conditional operation is defined as follows by order of precedence:
 * - ∀ x, y. cond(undefined, x, y) = undefined
 * - ∀ x, y. cond(null, x, y) = null
 * - ∀ x, y. cond(true, x, y) = x
 * - ∀ x, y. cond(false, x, y) = y
 */
function cond(c, ifTrue, ifFalse) {
	if (c === undefined) {
		return undefined
	}

	if (c === null) {
		return null
	}

	return c ? ifTrue() : ifFalse()
}

export default class Engine {
	traversedParameters = new Set();
	cache;

	static outputs = %s;

	constructor(cache = false) {
		this.cache = cache ? {} : null
	}

	getMeta(ruleName) {
			return Engine.outputs[ruleName]?.meta
	}

	getType(ruleName) {
			return Engine.outputs[ruleName]?.type
	}

	evaluate(ruleName, ctx = {}) {
		this.traversedParameters = new Set()

		const value = this.ref(ruleName, ctx)
		const traversedParameters = Array.from(this.traversedParameters)
		const missingParameters = traversedParameters.filter(
			(param) =>  !(param in ctx),
		)

		return {
			value,
			traversedParameters,
			missingParameters,
		}
	}

	get(rule, ctx) {
		this.traversedParameters.add(rule)
		return ctx[rule]
	}

	ref(rule, ctx = {}) {
		if (rule in ctx) {
			return ctx[rule]
		}

		const f = this.rules[rule]
		if (typeof f !== 'function') {
			return f
		}

		if (this.cache) {
			const cache = this.cache[rule] ?? new WeakMap()

			if (cache.has(ctx)) {
				return cache.get(ctx)
			}
			const value = f(ctx)
			cache.set(ctx, value)
			this.cache[rule] = cache
			return value
		}

		return f(ctx)
	}

	rules = {
%s
	}
}
|}
      outputs_str rules_str
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
      (params_to_d_ts eval_tree outputs)
  in
  (index_js, index_d_ts)
