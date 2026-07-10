/* eslint-disable */

/**
 * @note We use branded types to represent the `undefined` and `not applicable`
 * values. This allows to have distinct types for these two values (see
 * https://effect.website/docs/code-style/branded-types/ or
 * https://github.com/microsoft/TypeScript/issues/202).
 *
 *
 * @typedef {symbol & { __brand: 'NotDefined' }} NotDefined
 * @typedef {symbol & { __brand: 'NotApplicable' }} NotApplicable
 */

/**
 * Representation of an undefined rule (e.g. parameter wihout a value). It
 * spreads to all operations, except in:
 * - definition checks (`est définie`, `est non définie`),
 * - in binop operations with a neutral element (e.g. `add`, `mul`, `and` and
 *   `or`).
 *
 *  @note Prefer to use the {@link p.isNotDefined} function to benefit from type
 *  discrimination, where a simple `===` can't.
 */
const NotDefined = /** @type {NotDefined} */ (Symbol.for('not defined'))

/**
 * Representation of a not applicable rule (e.g. a rule that is not applicable
 * in the current context). It spreads to all  operations, except in:
 * - applicability checks (`est applicable`, `n'est pas applicable`),
 * - and sum operations (e.g. `add`, `sub`, `and` and `or`) where it is
 *   considered as a neutral element.
 *
 *  @note Prefer to use the {@link p.isNotApplicable} function to benefit from
 *  type discrimination, where a simple `===` can't.
 */
const NotApplicable = /** @type {NotApplicable} */ (
	Symbol.for('not applicable')
)

/**
 * @private
 * @typedef {Date | number | string | boolean | NotApplicable | NotDefined} Value
 *ui
 * Other types:
 * @typedef {string} RuleName
 * @typedef {Record<string, Record<string, Value>>} Trace
 * @typedef {Record<string, Partial<Record<RuleName, Value>>>} Global
 *
 * @typedef {{cache?: boolean, trace?: boolean}} Options
 * @typedef {{[rule: RuleName]: Value } & { _global: Partial<Record<RuleName, Value>>, _options: Options, _trace: Trace, _context_stack: string }} Context
 * @typedef {{value: Value, needed: RuleName[], missing: RuleName[], trace: Trace}} Evaluated
 */

/**
 * Checks if a Publicodes value is not applicable.
 *
 * @note This function allow to discriminate values where a simple `value ===
 * NotApplicable` can't.
 *
 * @param {Value} value
 * @returns {value is NotApplicable}
 */
function isNotApplicable(value) {
	return value === NotApplicable
}

/**
 * Checks if a Publicodes value is not defined.
 *
 * @note This function allow to discriminate values where a simple `value ===
 * NotDefined` can't.
 *
 * @param {Value} value
 * @returns {value is NotDefined}
 */
function isNotDefined(value) {
	return value === NotDefined
}

/**
 * TODO:
 * - Don't use lazy values if it's a constant value?
 * - For now, dates are compared using the JS polymorphic variant of the
 *   operator. However, if we choose to continue with the JS approach, we
 *   should use https://github.com/CatalaLang/dates-calc.
 *
 * FIXME:
 * - In the actual implementation (Publicodes 1), the `null` value is not
 *   commutative in the `LazyNullOps` operations.
 *   null * 0 = null and 0 * null = 0.
 * 	 - Why don't we always spreads undefined values before not applicable ones?
 * 	 - Do we really want to keep lazy null ops?
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
 * @param {number | NotDefined | NotApplicable} l
 * @param {number | NotDefined | NotApplicable} r
 * @returns {number | NotDefined}
 *
 * @specification
 * The addition operation is defined as follows by order of precedence:
 * - ∀ x. add(NotDefined, x) = add(x, NotDefined) = NotDefined
 * - ∀ x. add(x, NotApplicable) = add(NotApplicable, x) = x
 * - ∀ x. add(NotApplicable, NotApplicable) = 0
 * - ∀ x, y. add(x, y) = x + y
 */
function $add(l, r) {
	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	const l0 = isNotApplicable(l) ? 0 : l
	const r0 = isNotApplicable(r) ? 0 : r

	return l0 + r0
}

/**
 * @param {number | NotDefined | NotApplicable} l
 * @param {number | NotDefined | NotApplicable} r
 * @returns {number | NotDefined}
 *
 * @specification
 * The subtraction operation is defined as follows by order of precedence:
 * - ∀ x. sub(NotDefined, x) = sub(x, NotDefined) = NotDefined
 * - ∀ x. sub(NotApplicable, NotApplicable) = 0
 * - ∀ x. sub(x, NotApplicable) = x
 * - ∀ x. sub(NotApplicable, x) = -x
 * - ∀ x, y. sub(x, y) = x - y
 */
function $sub(l, r) {
	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	const l0 = isNotApplicable(l) ? 0 : l
	const r0 = isNotApplicable(r) ? 0 : r

	return l0 - r0
}

/**
 * @param {number | NotDefined | NotApplicable} l
 * @param {() => number | NotDefined | NotApplicable} right
 * @returns {number | NotApplicable | NotDefined}
 *
 * @specification
 * The multiplication operation is defined as follows by order of precedence:
 * - ∀ x. mul(0, x) = mul(x, 0) = 0
 * - ∀ x. mul(NotDefined, x) = mul(x, NotDefined) = NotDefined
 * - ∀ x. mul(NotApplicable, x) = mul(x, NotApplicable) = NotApplicable
 */
function $mul(l, right) {
	if (l === 0) {
		return 0
	}

	const r = right()
	if (r === 0) {
		return 0
	}

	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	if (isNotApplicable(l) || isNotApplicable(r)) {
		return NotApplicable
	}

	return l * r
}

/**
 * @param {number | NotDefined | NotApplicable} l
 * @param {() => number | NotDefined | NotApplicable} right
 * @returns {number | NotApplicable | NotDefined}
 *
 * @throws {RuntimeError} if the right operand is evaluated to zero.
 *
 * @specification
 * The division operation is defined as follows by order of precedence:
 * - ∀ x. div(0, x) = 0
 * - ∀ x. div(x, 0) = throw RuntimeError('Division by zero')
 * - ∀ x. div(NotDefined, x) = div(x, NotDefined) = NotDefined
 * - ∀ x. div(NotApplicable, x) = div(x, NotApplicable) = NotApplicable
 * - ∀ x, y. div(x, y) = x / y
 */
function $div(l, right) {
	if (l === 0) {
		return 0
	}

	const r = right()
	if (r === 0) {
		// TODO: improve information provided in the error
		throw new RuntimeError(`Division by zero: ${String(l)} / ${String(r)}`)
	}

	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	if (isNotApplicable(l) || isNotApplicable(r)) {
		return NotApplicable
	}

	return l / r
}

/**
 * @param {number | NotDefined | NotApplicable} l
 * @param {() => number | NotDefined | NotApplicable} right
 * @returns {number | NotDefined | NotApplicable}
 *
 * @specification
 * The power operation is defined as follows by order of precedence:
 * - ∀ x. pow(0, x) = 0
 * - ∀ x. pow(x, 0) = 1
 * - ∀ x. pow(NotDefined, y) = pow(x, NotDefined) = NotDefined
 * - ∀ x. pow(x, NotApplicable) = pow(NotApplicable, x) = NotApplicable
 * - ∀ x, y. pow(x, y) = x ** y
 */
function $pow(l, right) {
	if (l === 0) {
		return 0
	}

	const r = right()
	if (r === 0) {
		return 1
	}

	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	if (isNotApplicable(l) || isNotApplicable(r)) {
		return NotApplicable
	}

	return l ** r
}

/** Basic boolean operations */

/**
 * @param {Value} l
 * @param {Value} r
 * @returns {boolean | NotDefined}
 *
 * @specification
 * The equality operation is defined as follows by order of precedence:
 * - ∀ x. eq(NotDefined, x) = eq(x, NotDefined) = NotDefined
 * - ∀ x, y. eq(x, y) = x === y
 */
function $eq(l, r) {
	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	// For dates, we need to explicitly compare their time values (see
	// https://stackoverflow.com/questions/492994/compare-two-dates-with-javascript).
	if (l instanceof Date && r instanceof Date) {
		return l.getTime() === r.getTime()
	}

	return l === r
}

/**
 * @param {Value} l
 * @param {Value} r
 * @returns {boolean | NotDefined}
 *
 * @specification
 * The inequality operation is defined as follows by order of precedence:
 * - ∀ x. neq(NotDefined, x) = neq(x, NotDefined) = NotDefined
 * - ∀ x, y. neq(x, y) = x !== y
 */
function $neq(l, r) {
	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	// For dates, we need to explicitly compare their time values (see
	// https://stackoverflow.com/questions/492994/compare-two-dates-with-javascript).
	if (l instanceof Date && r instanceof Date) {
		return l.getTime() !== r.getTime()
	}

	return l !== r
}

/**
 * @param {Value} l
 * @param {() => Value} right
 * @returns {boolean | NotApplicable | NotDefined}
 *
 * @specification
 * The less than operation is defined as follows by order of precedence:
 * - ∀ x. lt(NotApplicable, x) = lt(x, NotApplicable) = NotApplicable
 * - ∀ x. lt(NotDefined, x) = lt(x, NotDefined) = NotDefined
 * - ∀ x, y. lt(x, y) = x < y
 */
function $lt(l, right) {
	if (isNotApplicable(l)) {
		return NotApplicable
	}

	const r = right()
	if (isNotApplicable(r)) {
		return NotApplicable
	}

	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	return l < r
}

/**
 * @param {Value} l
 * @param {() => Value} right
 * @returns {boolean | NotApplicable | NotDefined}
 *
 * @specification
 * The greater than operation is defined as follows by order of precedence:
 * - ∀ x. gt(NotApplicable, x) = gt(x, NotApplicable) = NotApplicable
 * - ∀ x. gt(NotDefined, x) = gt(x, NotDefined) = NotDefined
 * - ∀ x, y. lt(x, y) = x > y
 */
function $gt(l, right) {
	if (isNotApplicable(l)) {
		return NotApplicable
	}

	const r = right()
	if (isNotApplicable(r)) {
		return NotApplicable
	}

	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	return l > r
}

/**
 * @param {Value} l
 * @param {() => Value} right
 * @returns {boolean | NotApplicable | NotDefined}
 *
 * @specification
 * The less than or equal is defined as follows by order of precedence:
 * - ∀ x. lte(NotApplicable, x) = lte(x, NotApplicable) = NotApplicable
 * - ∀ x. lte(NotDefined, x) = lte(x, NotDefined) = NotDefined
 * - ∀ x, y. lte(x, y) = x <= y
 */
function $lte(l, right) {
	if (isNotApplicable(l)) {
		return NotApplicable
	}

	const r = right()
	if (isNotApplicable(r)) {
		return NotApplicable
	}

	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	return l <= r
}

/**
 * @param {Value} l
 * @param {() => Value} right
 * @returns {boolean | NotApplicable | NotDefined}
 *
 * @specification
 * The greater than or equal is defined as follows by order of precedence:
 * - ∀ x. gte(NotApplicable, x) = gte(x, NotApplicable) = NotApplicable
 * - ∀ x. gte(NotDefined, x) = gte(x, NotDefined) = NotDefined
 * - ∀ x, y. gte(x, y) = x >= y
 */
function $gte(l, right) {
	if (isNotApplicable(l)) {
		return NotApplicable
	}

	const r = right()
	if (isNotApplicable(r)) {
		return NotApplicable
	}

	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	return l >= r
}

/**
 * @param {boolean | NotDefined | NotApplicable} l
 * @param {() => boolean | NotDefined | NotApplicable} right
 * @returns {boolean | NotDefined}
 *
 * @specification
 * The logical AND operation is defined as follows by order of precedence:
 * - ∀ x. and(false, x) = and(x, false) = false
 * - ∀ x. and(NotDefined, x) = and(x, NotDefined) = NotDefined
 * - ∀ x. and(NotApplicable, x) = and(x, NotApplicable) = false
 * - ∀ x, y. and(x, y) = x && y
 */
function $and(l, right) {
	if (isNotApplicable(l) || l === false) {
		return false
	}

	const r = right()
	if (isNotApplicable(r) || r === false) {
		return false
	}

	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	return true
}

/**
 * @param {boolean | NotDefined | NotApplicable} l
 * @param {() => boolean | NotDefined | NotApplicable} right
 * @returns {boolean | NotDefined}
 *
 * @specification
 * The logical OR operation is defined as follows by order of precedence:
 * - ∀ x. or(true, x) = or(x, true) = true
 * - ∀ x. or(NotDefined, x) = or(x, NotDefined) = NotDefined
 * - ∀ x. or(NotApplicable, NotApplicable) = false
 * - ∀ x. or(NotApplicable, x) = or(x, NotApplicable) = x
 * - ∀ x, y. or(x, y) = x || y
 */
function $or(l, right) {
	if (l === true) {
		return true
	}

	const r = right()
	if (r === true) {
		return true
	}

	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	return false
}

/** Unary operations */

/**
 * @param {number | NotDefined | NotApplicable } val
 * @returns {number | NotDefined}
 * @specification
 * The unary negation operation is defined as follows by order of precedence:
 * 1. ∀ x. neg(NotDefined) = NotDefined
 * 2. ∀ x. neg(NotApplicable) = 0
 * 3. ∀ x. neg(x) = -x
 */
function $neg(val) {
	if (isNotDefined(val)) {
		return NotDefined
	}

	if (isNotApplicable(val)) {
		return 0
	}

	return -val
}

/**
 * @param {'up' | 'down' | 'nearest'} mode
 * @param {number | NotDefined | NotApplicable} val
 * @param {() => number | NotDefined | NotApplicable} precision
 * @returns {number | NotDefined | NotApplicable}
 *
 * @throws {RuntimeError} if the precision is negative, equals to zero or not an integer.
 *
 * @specification
 * The rounding operation is defined as follows by order of precedence:
 * - ∀ x. round(mode, NotDefined, precision) = NotDefined
 * - ∀ x. round(mode, NotApplicable, precision) = NotApplicable
 * - ∀ x. round(mode, x, NotDefined) = NotDefined
 * - ∀ x. round(mode, x, NotApplicable) = x
 * - ∀ x, p. round(mode, x, p) = rounded value of x with the given mode and precision p
 *    - if mode = 'up', round towards the nearest multiple of p greater than or equal to x
 *    - if mode = 'down', round towards the nearest multiple of p less than or equal to x
 *    - if mode = 'nearest', round to the nearest multiple of p
 */
function $round(mode, val, precision) {
	if (isNotDefined(val)) {
		return NotDefined
	}

	if (isNotApplicable(val)) {
		return NotApplicable
	}

	const p = precision()
	if (isNotDefined(p)) {
		return NotDefined
	}

	if (isNotApplicable(p)) {
		return val
	}

	if (p <= 0) {
		throw new RuntimeError(
			'Rounding error: precision must be a positive number, got: ' + p,
		)
	}

	/** @type {(num: number) => number} */
	const toPrecision = (num) =>
		// NOTE: Use 15 precision for floating number in JS https://stackoverflow.com/a/3644302
		// NOTE: the unary plus is used to remove trailing zeros and convert back
		// the string representation to a number.
		+num.toPrecision(15)

	return toPrecision(
		mode === 'up' ? Math.ceil(toPrecision(val / p)) * p
		: mode === 'down' ? Math.floor(toPrecision(val / p)) * p
		: Math.round(toPrecision(val / p)) * p,
	)
}

/**
 * @param {number | NotDefined | NotApplicable} l
 * @param {number | NotDefined | NotApplicable} r
 * @returns {number | NotDefined | NotApplicable}
 *
 * @specification
 * The rounding operation is defined as follows by order of precedence:
 * - ∀ x. min(x, NotDefined) = min(NotDefined, x) = NotDefined
 * - ∀ x. min(x, NotApplicable) = min(NotApplicable, x) = x
 * - ∀ x, y. min(x, y) = the minimum value between x and y
 */
function $min(l, r) {
	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	if (isNotApplicable(l) || isNotApplicable(r)) {
		return isNotApplicable(l) ? r : l
	}

	return l < r ? l : r
}

/**
 * @param {number | NotDefined | NotApplicable} l
 * @param {number | NotDefined | NotApplicable} r
 * @returns {number | NotDefined | NotApplicable}
 *
 * @specification
 * The rounding operation is defined as follows by order of precedence:
 * - ∀ x. max(x, NotDefined) = max(NotDefined, x) = NotDefined
 * - ∀ x. max(x, NotApplicable) = max(NotApplicable, x) = x
 * - ∀ x, y. max(x, y) = the max value between x and y
 */
function $max(l, r) {
	if (isNotDefined(l) || isNotDefined(r)) {
		return NotDefined
	}

	if (isNotApplicable(l) || isNotApplicable(r)) {
		return isNotApplicable(l) ? r : l
	}

	return l > r ? l : r
}

/**
 * @param {boolean | NotDefined | NotApplicable} c
 * @param {() => Value} ifTrue
 * @param {() => Value} ifFalse
 * @returns {Value}
 *
 * @specification
 * The conditional operation is defined as follows by order of precedence:
 * - ∀ x, y. cond(NotDefined, x, y) = NotDefined
 * - ∀ x, y. cond(NotApplicable, x, y) = NotApplicable
 * - ∀ x, y. cond(true, x, y) = x
 * - ∀ x, y. cond(false, x, y) = y
 */
function $cond(c, ifTrue, ifFalse) {
	if (c === NotDefined) {
		return NotDefined
	}

	if (isNotApplicable(c)) {
		return NotApplicable
	}

	return c ? ifTrue() : ifFalse()
}

/**
 * Retrieves the value of the given rule from the context and updates the list
 * of accessed parameters.
 *
 * @param {RuleName} rule
 * @param {Context} ctx
 * @param {RuleName[]} params
 * @returns {Value}
 */
function $get(rule, ctx, params) {
	if (rule in ctx) {
		return ctx[rule]
	}

	params.push(rule)

	return ctx._global[rule] ?? NotDefined
}

/**
 * Global cache for rules evaluation.
 * @type {Record<string, WeakMap<object, any>>}
 */
const globalCache = {}

/**
 * Evaluates a reference to a rule. If the rule is already defined in the
 * context, it returns its value. Otherwise, it evaluates the rule using the
 * provided function `fn`.
 *
 * @param {RuleName} rule
 * @param {Function} fn
 * @param {Context} ctx
 * @param {RuleName[]} params
 * @returns {Value}
 */
function $ref(rule, fn, ctx, params) {
	if (rule in ctx || rule in ctx._global) {
		return $get(rule, ctx, params)
	}

	if (ctx._options.cache) {
		const cache = globalCache[rule] ?? new WeakMap()
		if (cache.has(ctx)) {
			return cache.get(ctx)
		}
		const value = fn(ctx, params)
		cache.set(ctx, value)
		globalCache[rule] = cache
		return value
	}

	return fn(ctx, params)
}

/**
 * Evaluates a `fn` function with a given global context and options. It returns
 * the value of the evaluation, the list of needed parameters (i.e. parameter
 * rules accessed during the evaluation) and the list of missing parameters
 * (i.e. parameter rules accessed during the evaluation that are undefined in
 * the global context).
 *
 * @param {Function} fn
 * @param {Context['_global']} _global
 * @param {Options} options
 * @returns {Evaluated}
 */
function $evaluate(fn, _global, options = {}) {
	/** @type {RuleName[]} */
	const params = []
	const ctx = { _global, _options: options, _trace: {}, _context_stack: '' }
	const value = fn(ctx, params)
	const needed = Array.from(new Set(params))
	const missing = needed.filter((p) => !(p in _global))

	return { value, needed, missing, trace: ctx._trace }
}

/**
 * Return an evaluated value, and if the [trace] option is set, hydrates the
 * evaluation trace.
 *
 * @param {string} id
 * @param {Context} ctx
 * @param {Value} value
 * @returns {Value}
 */
function $ret(id, ctx, value) {
	if (ctx._options.trace) {
		ctx._trace[id] ??= {}
		ctx._trace[id][ctx._context_stack] = value
	}
	return value
}

export const p = {
	NotDefined,
	NotApplicable,
	isNotDefined,
	isNotApplicable,
}


/** Compiled private Publicodes rules */

/** @type {(ctx: Context, params: RuleName[]) => Date} */
function _date(ctx, params) {
  return /** @type {Date} */ (
    $ret("b6dc37cc52959fbd07e4b01c933884ae", ctx, $get("date", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _dirigeant(ctx, params) {
  return /** @type {unknown} */ (
    $ret("813543507a91cd7d752eb3a4fafe3f91", ctx, $get("dirigeant", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur(ctx, params) {
  return /** @type {boolean} */ (
    $ret("85e17369a7c29041b3907d86be16c5ae", ctx, $cond(
      $ret("85e17369a7c29041b3907d86be16c5ae", ctx, (isNotDefined($ret("fb5b1413976ac5a0cf495f1dfc7b3a69", ctx, $eq(
        $ret("26c3a128bccf444a3877878af51236b9", ctx, $ref("dirigeant . régime social", _dirigeant_·_régime_social, ctx, params)),
        $ret("6b5a30f935be3b2c6c0f54d9d80e184e", ctx, "auto-entrepreneur")))))), () => $ret("819142618558a6dc2248357642c4aced", ctx, false), () => $ret("fb5b1413976ac5a0cf495f1dfc7b3a69", ctx, $eq(
        $ret("26c3a128bccf444a3877878af51236b9", ctx, $ref("dirigeant . régime social", _dirigeant_·_régime_social, ctx, params)),
        $ret("6b5a30f935be3b2c6c0f54d9d80e184e", ctx, "auto-entrepreneur")))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _dirigeant_·_auto__t__entrepreneur_·_Acre(ctx, params) {
  return /** @type {unknown} */ (
    $ret("4e8960ec61fb5e4789088e6274df42b2", ctx, $cond(
      $ret("4e8960ec61fb5e4789088e6274df42b2", ctx, $or(
        $ret("4e8960ec61fb5e4789088e6274df42b2", ctx, (isNotDefined($ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $cond(
          $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $or(
            $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $eq(
              $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
              $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, NotApplicable))),
            () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $or(
              $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, (isNotDefined($ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params))))),
              () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $eq(
                $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
                $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, false))))))), () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . exonérations . ACRE", _dirigeant_·_exonérations_·_ACRE, ctx, params)), () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, NotApplicable)))))),
        () => $ret("4e8960ec61fb5e4789088e6274df42b2", ctx, $or(
          $ret("4e8960ec61fb5e4789088e6274df42b2", ctx, $eq(
            $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $cond(
              $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $or(
                $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $eq(
                  $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
                  $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, NotApplicable))),
                () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $or(
                  $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, (isNotDefined($ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params))))),
                  () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $eq(
                    $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
                    $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, false))))))), () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . exonérations . ACRE", _dirigeant_·_exonérations_·_ACRE, ctx, params)), () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, NotApplicable))),
            $ret("4e8960ec61fb5e4789088e6274df42b2", ctx, false))),
          () => $ret("4e8960ec61fb5e4789088e6274df42b2", ctx, $eq(
            $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $cond(
              $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $or(
                $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $eq(
                  $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
                  $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, NotApplicable))),
                () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $or(
                  $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, (isNotDefined($ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params))))),
                  () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $eq(
                    $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
                    $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, false))))))), () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, $ref("dirigeant . exonérations . ACRE", _dirigeant_·_exonérations_·_ACRE, ctx, params)), () => $ret("e4fe09fa25a563ffca7f8cbf030d199b", ctx, NotApplicable))),
            $ret("4e8960ec61fb5e4789088e6274df42b2", ctx, NotApplicable))))))), () => $ret("4e8960ec61fb5e4789088e6274df42b2", ctx, NotApplicable), () => $ret("24c983d94338f888014eecdc2be69548", ctx, $get("dirigeant . auto-entrepreneur . Acre", ctx, params))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _dirigeant_·_auto__t__entrepreneur_·_Acre_·_notification_calcul_ACRE_annuel(ctx, params) {
  return /** @type {unknown} */ (
    $ret("c790aae2a902e3cbe518eb1e2b8efc97", ctx, $get("dirigeant . auto-entrepreneur . Acre . notification calcul ACRE annuel", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_Acre(ctx, params) {
  return /** @type {number} */ (
    $ret("0f70e5db0f5ab3bbb355a2bcda0c15b8", ctx, $cond(
      $ret("0f70e5db0f5ab3bbb355a2bcda0c15b8", ctx, $eq(
        $ret("9650cd999e33dea383084841124dec87", ctx, $lt(
          $ret("70bc47de8c4618972c0a707158be4bff", ctx, $ref("entreprise . date de création", _entreprise_·_date_de_création, ctx, params)),
          () => $ret("be4f54ce75f9bb569c84237c1f3a6f0a", ctx, new Date('2019-04-01')))),
        $ret("0f70e5db0f5ab3bbb355a2bcda0c15b8", ctx, true))), () => $ret("6904d1c290443cd39b8d675e212d18bd", ctx, 25.), () => $ret("0f70e5db0f5ab3bbb355a2bcda0c15b8", ctx, $cond(
        $ret("0f70e5db0f5ab3bbb355a2bcda0c15b8", ctx, $eq(
          $ret("ac64ae78c296d92fcc80f2a380adef53", ctx, $lt(
            $ret("d815de941ecd829545c093910c58f241", ctx, $ref("entreprise . date de création", _entreprise_·_date_de_création, ctx, params)),
            () => $ret("05ee68c07f6c86d4f42c049d3f0b9d7d", ctx, new Date('2020-04-01')))),
          $ret("0f70e5db0f5ab3bbb355a2bcda0c15b8", ctx, true))), () => $ret("34c985f8f3c643f029d94fa3c026445e", ctx, 75.), () => $ret("0f70e5db0f5ab3bbb355a2bcda0c15b8", ctx, $cond(
          $ret("0f70e5db0f5ab3bbb355a2bcda0c15b8", ctx, $eq(
            $ret("5e9bd60bfe37bb8414013dedf204f2c4", ctx, $lt(
              $ret("7619c27ae3a98b6196845a59ea5e4e8c", ctx, $ref("entreprise . durée d'activité", _entreprise_·_durée_dʹactivité, ctx, params)),
              () => $ret("b3b786df96cf5937bdd0b6bc74b6f4df", ctx, 1.))),
            $ret("0f70e5db0f5ab3bbb355a2bcda0c15b8", ctx, true))), () => $ret("cbfd6e61e11cb18c26c53fb6db25523f", ctx, 50.), () => $ret("0f70e5db0f5ab3bbb355a2bcda0c15b8", ctx, NotApplicable)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_CIPAV(ctx, params) {
  return /** @type {number} */ (
    $ret("94ee0e6ad8fc0740b616497774f9f657", ctx, $cond(
      $ret("94ee0e6ad8fc0740b616497774f9f657", ctx, $or(
        $ret("94ee0e6ad8fc0740b616497774f9f657", ctx, (isNotDefined($ret("8dda7d1f59d9105db3824ea077adc974", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params))))),
        () => $ret("94ee0e6ad8fc0740b616497774f9f657", ctx, $or(
          $ret("94ee0e6ad8fc0740b616497774f9f657", ctx, $eq(
            $ret("8dda7d1f59d9105db3824ea077adc974", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("94ee0e6ad8fc0740b616497774f9f657", ctx, false))),
          () => $ret("94ee0e6ad8fc0740b616497774f9f657", ctx, $eq(
            $ret("8dda7d1f59d9105db3824ea077adc974", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("94ee0e6ad8fc0740b616497774f9f657", ctx, NotApplicable))))))), () => $ret("94ee0e6ad8fc0740b616497774f9f657", ctx, NotApplicable), () => $ret("8a5ed60c360a0417aa7c733b6ad9bff0", ctx, $cond(
        $ret("8a5ed60c360a0417aa7c733b6ad9bff0", ctx, $eq(
          $ret("1648bc8432a7556c5ac9cd8d77376db9", ctx, $gte(
            $ret("9a353bfa329a63c6c7704147e8f4b57b", ctx, $ref("entreprise . date de création", _entreprise_·_date_de_création, ctx, params)),
            () => $ret("a88ac184b32edae8ca4db981b05ce2f2", ctx, new Date('2020-04-01')))),
          $ret("8a5ed60c360a0417aa7c733b6ad9bff0", ctx, true))), () => $ret("7c3b2689c308bd8e7c04c1ad9566fd52", ctx, $cond(
          $ret("7c3b2689c308bd8e7c04c1ad9566fd52", ctx, $eq(
            $ret("46b855686c70369d3bc70bb98a4e1c3b", ctx, $gte(
              $ret("3075659d8ecf1b76d5364a6660831d10", ctx, $ref("date", _date, ctx, params)),
              () => $ret("55a23fc120c49d02acfac3865de7bbb2", ctx, new Date('2024-07')))),
            $ret("7c3b2689c308bd8e7c04c1ad9566fd52", ctx, true))), () => $ret("044d94c18bdd420baa8299314d19a65b", ctx, 13.9), () => $ret("155de7113470e6959ab6bbb38b975d5c", ctx, 12.1))), () => $ret("14676168bd0bd29f125a4e7ccc310b07", ctx, $mul(
          $ret("14676168bd0bd29f125a4e7ccc310b07", ctx, $mul(
            $ret("55532e661b20ef4b92300aca553132b2", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux Acre", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_Acre, ctx, params)),
            () => $ret("7378a21da33b7dbb7d5ae0691636eec5", ctx, $cond(
              $ret("7378a21da33b7dbb7d5ae0691636eec5", ctx, $neq(
                $ret("7378a21da33b7dbb7d5ae0691636eec5", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux CIPAV", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_CIPAV, ctx, params)),
                $ret("7378a21da33b7dbb7d5ae0691636eec5", ctx, NotApplicable))), () => $ret("7378a21da33b7dbb7d5ae0691636eec5", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux CIPAV", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_CIPAV, ctx, params)), () => $ret("7378a21da33b7dbb7d5ae0691636eec5", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_taux, ctx, params)))))),
          () => $ret("14676168bd0bd29f125a4e7ccc310b07", ctx, 0.01)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_service_BIC(ctx, params) {
  return /** @type {number} */ (
    $ret("ab7f200f602f09620bd7c9e70fc52433", ctx, $cond(
      $ret("ab7f200f602f09620bd7c9e70fc52433", ctx, $or(
        $ret("ab7f200f602f09620bd7c9e70fc52433", ctx, (isNotDefined($ret("c40645c508fc2f7cbcda4530ba76fa33", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params))))),
        () => $ret("ab7f200f602f09620bd7c9e70fc52433", ctx, $or(
          $ret("ab7f200f602f09620bd7c9e70fc52433", ctx, $eq(
            $ret("c40645c508fc2f7cbcda4530ba76fa33", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("ab7f200f602f09620bd7c9e70fc52433", ctx, false))),
          () => $ret("ab7f200f602f09620bd7c9e70fc52433", ctx, $eq(
            $ret("c40645c508fc2f7cbcda4530ba76fa33", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("ab7f200f602f09620bd7c9e70fc52433", ctx, NotApplicable))))))), () => $ret("ab7f200f602f09620bd7c9e70fc52433", ctx, NotApplicable), () => $ret("6d6b747658974400450b5b7ff1a60068", ctx, $round("nearest", $ret("6d6b747658974400450b5b7ff1a60068", ctx, $mul(
        $ret("6d6b747658974400450b5b7ff1a60068", ctx, $mul(
          $ret("df72896baf4d24cb05b20a63f79a850a", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux Acre", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_Acre, ctx, params)),
          () => $ret("f73bf8727d071cf940361880b04dd24c", ctx, $cond(
            $ret("f73bf8727d071cf940361880b04dd24c", ctx, $neq(
              $ret("f73bf8727d071cf940361880b04dd24c", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux service BIC", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_service_BIC, ctx, params)),
              $ret("f73bf8727d071cf940361880b04dd24c", ctx, NotApplicable))), () => $ret("f73bf8727d071cf940361880b04dd24c", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux service BIC", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_service_BIC, ctx, params)), () => $ret("f73bf8727d071cf940361880b04dd24c", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_taux, ctx, params)))))),
        () => $ret("6d6b747658974400450b5b7ff1a60068", ctx, 0.01))), () => $ret("14d9a48d65a93d8b6d8e0f1151e9ad38", ctx, $pow(
        $ret("14d9a48d65a93d8b6d8e0f1151e9ad38", ctx, 10.),
        () => $ret("14d9a48d65a93d8b6d8e0f1151e9ad38", ctx, (-$ret("14d9a48d65a93d8b6d8e0f1151e9ad38", ctx, 1.)))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_service_BNC(ctx, params) {
  return /** @type {number} */ (
    $ret("63719a6cf2d888b4349937109dae37da", ctx, $cond(
      $ret("63719a6cf2d888b4349937109dae37da", ctx, $or(
        $ret("63719a6cf2d888b4349937109dae37da", ctx, (isNotDefined($ret("9d49c462663498e320c822f1828faf37", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params))))),
        () => $ret("63719a6cf2d888b4349937109dae37da", ctx, $or(
          $ret("63719a6cf2d888b4349937109dae37da", ctx, $eq(
            $ret("9d49c462663498e320c822f1828faf37", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("63719a6cf2d888b4349937109dae37da", ctx, false))),
          () => $ret("63719a6cf2d888b4349937109dae37da", ctx, $eq(
            $ret("9d49c462663498e320c822f1828faf37", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("63719a6cf2d888b4349937109dae37da", ctx, NotApplicable))))))), () => $ret("63719a6cf2d888b4349937109dae37da", ctx, NotApplicable), () => $ret("a7a3c9986dd1620a5edebbf1d5d7309c", ctx, $round("nearest", $ret("a7a3c9986dd1620a5edebbf1d5d7309c", ctx, $mul(
        $ret("a7a3c9986dd1620a5edebbf1d5d7309c", ctx, $mul(
          $ret("33c9c66c7a012fbf4a176ee11472ed4f", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux Acre", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_Acre, ctx, params)),
          () => $ret("c7c081042c45369531a94410ecb73a37", ctx, $cond(
            $ret("c7c081042c45369531a94410ecb73a37", ctx, $neq(
              $ret("c7c081042c45369531a94410ecb73a37", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux service BNC", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_service_BNC, ctx, params)),
              $ret("c7c081042c45369531a94410ecb73a37", ctx, NotApplicable))), () => $ret("c7c081042c45369531a94410ecb73a37", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux service BNC", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_service_BNC, ctx, params)), () => $ret("c7c081042c45369531a94410ecb73a37", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_taux, ctx, params)))))),
        () => $ret("a7a3c9986dd1620a5edebbf1d5d7309c", ctx, 0.01))), () => $ret("12c52b2337f9b51004b828c3e2e22846", ctx, $pow(
        $ret("12c52b2337f9b51004b828c3e2e22846", ctx, 10.),
        () => $ret("12c52b2337f9b51004b828c3e2e22846", ctx, (-$ret("12c52b2337f9b51004b828c3e2e22846", ctx, $cond(
          $ret("12c52b2337f9b51004b828c3e2e22846", ctx, $eq(
            $ret("3594be51eec5d352f5c7cb94f3a51187", ctx, $gte(
              $ret("6a3383face1f252e197be7f66f6a971c", ctx, $ref("date", _date, ctx, params)),
              () => $ret("bc838f86f74e5183c23cf37d3da11deb", ctx, new Date('2026-01')))),
            $ret("12c52b2337f9b51004b828c3e2e22846", ctx, true))), () => $ret("deab118cb5cebf5c3abb83034f958016", ctx, 2.), () => $ret("fb8c188b9940572b98d77724ca069849", ctx, 1.)))))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_vente_restauration_hébergement(ctx, params) {
  return /** @type {number} */ (
    $ret("d5f9d1ef059d3fe3accfa8fe074637c9", ctx, $cond(
      $ret("d5f9d1ef059d3fe3accfa8fe074637c9", ctx, $or(
        $ret("d5f9d1ef059d3fe3accfa8fe074637c9", ctx, (isNotDefined($ret("862ce9d170cf56dbf53805b3d4a56fc4", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params))))),
        () => $ret("d5f9d1ef059d3fe3accfa8fe074637c9", ctx, $or(
          $ret("d5f9d1ef059d3fe3accfa8fe074637c9", ctx, $eq(
            $ret("862ce9d170cf56dbf53805b3d4a56fc4", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("d5f9d1ef059d3fe3accfa8fe074637c9", ctx, false))),
          () => $ret("d5f9d1ef059d3fe3accfa8fe074637c9", ctx, $eq(
            $ret("862ce9d170cf56dbf53805b3d4a56fc4", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("d5f9d1ef059d3fe3accfa8fe074637c9", ctx, NotApplicable))))))), () => $ret("d5f9d1ef059d3fe3accfa8fe074637c9", ctx, NotApplicable), () => $ret("ca493a45839ade6de3096f20458b658b", ctx, $round("nearest", $ret("ca493a45839ade6de3096f20458b658b", ctx, $mul(
        $ret("ca493a45839ade6de3096f20458b658b", ctx, $mul(
          $ret("fc22b7882526840121d0b2363bc47f28", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux Acre", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_Acre, ctx, params)),
          () => $ret("5c39ebc4543482e459a86bbec6a2b905", ctx, $cond(
            $ret("5c39ebc4543482e459a86bbec6a2b905", ctx, $neq(
              $ret("5c39ebc4543482e459a86bbec6a2b905", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_vente_restauration_hébergement, ctx, params)),
              $ret("5c39ebc4543482e459a86bbec6a2b905", ctx, NotApplicable))), () => $ret("5c39ebc4543482e459a86bbec6a2b905", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_vente_restauration_hébergement, ctx, params)), () => $ret("5c39ebc4543482e459a86bbec6a2b905", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_taux, ctx, params)))))),
        () => $ret("ca493a45839ade6de3096f20458b658b", ctx, 0.01))), () => $ret("1ccc83e7457df6529d204b16cdef1478", ctx, $pow(
        $ret("1ccc83e7457df6529d204b16cdef1478", ctx, 10.),
        () => $ret("1ccc83e7457df6529d204b16cdef1478", ctx, (-$ret("1ccc83e7457df6529d204b16cdef1478", ctx, 1.)))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_Cipav(ctx, params) {
  return /** @type {boolean} */ (
    $ret("6fbca2c53f7b5614fa8d674ff4be1898", ctx, $or(
      $ret("74b1bbcab3b495e3054d439905a82148", ctx, $ref("entreprise . activité . nature . libérale . réglementée", _entreprise_·_activité_·_nature_·_libérale_·_réglementée, ctx, params)),
      () => $ret("6fbca2c53f7b5614fa8d674ff4be1898", ctx, $or(
        $ret("acbe40ccca2e7706d311c387d6e351a8", ctx, $and(
          $ret("705cc3f56b96d769d5ef274741126f01", ctx, $eq(
            $ret("16d430ecb0adfbae2774273a7a9eadaa", ctx, $ref("entreprise . activité . nature", _entreprise_·_activité_·_nature, ctx, params)),
            $ret("ab5a54b9a68d8e72c2d9be383f7f97b3", ctx, "libérale"))),
          () => $ret("acbe40ccca2e7706d311c387d6e351a8", ctx, $and(
            $ret("81ada49a91b98ef48069d5e9acf6ae6a", ctx, $lt(
              $ret("01c9559c621edf7f72bb0198709d0f41", ctx, $ref("entreprise . date de création", _entreprise_·_date_de_création, ctx, params)),
              () => $ret("8223b0aceed94328a3016da7b139c8f5", ctx, new Date('2018-01')))),
            () => $ret("acbe40ccca2e7706d311c387d6e351a8", ctx, $and(
              $ret("c9da4017e56e75a44ba2a557343ab626", ctx, $eq(
                $ret("dbd4d518f1c012afc0637626389c7202", ctx, $ref("dirigeant . auto-entrepreneur . Cipav . adhérent", _dirigeant_·_auto__t__entrepreneur_·_Cipav_·_adhérent, ctx, params)),
                $ret("dbd8657a4f20dc11037832bfca640c1a", ctx, true))),
              () => $ret("acbe40ccca2e7706d311c387d6e351a8", ctx, true))))))),
        () => $ret("6fbca2c53f7b5614fa8d674ff4be1898", ctx, false)))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_Cipav_·_adhérent(ctx, params) {
  return /** @type {boolean} */ (
    $ret("7ea8a5f51faeadc76cd808cc6f936d5c", ctx, $cond(
      $ret("7ea8a5f51faeadc76cd808cc6f936d5c", ctx, (isNotDefined($ret("2f3c83dd9217c945fa9b628982e88bb7", ctx, $get("dirigeant . auto-entrepreneur . Cipav . adhérent", ctx, params))))), () => $ret("6d16517cf53bcbe80314cc7064c939a7", ctx, false), () => $ret("2f3c83dd9217c945fa9b628982e88bb7", ctx, $get("dirigeant . auto-entrepreneur . Cipav . adhérent", ctx, params))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_Cipav_·_retraite_complémentaire(ctx, params) {
  return /** @type {number} */ (
    $ret("69a66346847ca4cc1d202e75d8b04777", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_retraite_complémentaire, ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_DROM(ctx, params) {
  return /** @type {boolean} */ (
    $ret("1ecb1dcc6ec53473fedbb758855f04e5", ctx, $cond(
      $ret("1ecb1dcc6ec53473fedbb758855f04e5", ctx, $or(
        $ret("1ecb1dcc6ec53473fedbb758855f04e5", ctx, (isNotDefined($ret("601fb0814d6baf65abcf083b71c4955a", ctx, $ref("établissement . commune . département . outre-mer", _établissement_·_commune_·_département_·_outre__t__mer, ctx, params))))),
        () => $ret("1ecb1dcc6ec53473fedbb758855f04e5", ctx, $or(
          $ret("1ecb1dcc6ec53473fedbb758855f04e5", ctx, $eq(
            $ret("601fb0814d6baf65abcf083b71c4955a", ctx, $ref("établissement . commune . département . outre-mer", _établissement_·_commune_·_département_·_outre__t__mer, ctx, params)),
            $ret("1ecb1dcc6ec53473fedbb758855f04e5", ctx, false))),
          () => $ret("1ecb1dcc6ec53473fedbb758855f04e5", ctx, $eq(
            $ret("601fb0814d6baf65abcf083b71c4955a", ctx, $ref("établissement . commune . département . outre-mer", _établissement_·_commune_·_département_·_outre__t__mer, ctx, params)),
            $ret("1ecb1dcc6ec53473fedbb758855f04e5", ctx, NotApplicable))))))), () => $ret("1ecb1dcc6ec53473fedbb758855f04e5", ctx, NotApplicable), () => $ret("7541134561722ed519ac5f8d220f630e", ctx, true)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_DROM_·_première_période(ctx, params) {
  return /** @type {boolean} */ (
    $ret("3930c67c3b79d6ca1b4d20d45b25156b", ctx, $lte(
      $ret("dcd3a5338144572cb899e479a8622e06", ctx, $ref("entreprise . durée d'activité . trimestres civils", _entreprise_·_durée_dʹactivité_·_trimestres_civils, ctx, params)),
      () => $ret("8f00b870bbda3eab98b4c6a07232e971", ctx, 8.)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_DROM_·_seconde_période(ctx, params) {
  return /** @type {boolean} */ (
    $ret("f82860e60064c15b4ed3d46ba26ebf9c", ctx, $lte(
      $ret("f75918e02241304c91f6bf0a5a575e78", ctx, $ref("entreprise . durée d'activité . années civiles", _entreprise_·_durée_dʹactivité_·_années_civiles, ctx, params)),
      () => $ret("7943d07e319bd9682ff653c4e7841bb0", ctx, 3.)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_CIPAV(ctx, params) {
  return /** @type {number} */ (
    $ret("5897d607117cffc8ac829f6128483c79", ctx, $cond(
      $ret("5897d607117cffc8ac829f6128483c79", ctx, $or(
        $ret("5897d607117cffc8ac829f6128483c79", ctx, (isNotDefined($ret("0b0b7456ac0e9636fe654ec314cbc668", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params))))),
        () => $ret("5897d607117cffc8ac829f6128483c79", ctx, $or(
          $ret("5897d607117cffc8ac829f6128483c79", ctx, $eq(
            $ret("0b0b7456ac0e9636fe654ec314cbc668", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("5897d607117cffc8ac829f6128483c79", ctx, false))),
          () => $ret("5897d607117cffc8ac829f6128483c79", ctx, $eq(
            $ret("0b0b7456ac0e9636fe654ec314cbc668", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("5897d607117cffc8ac829f6128483c79", ctx, NotApplicable))))))), () => $ret("5897d607117cffc8ac829f6128483c79", ctx, NotApplicable), () => $ret("2141f1e1f14ee066ccdc3c0e1d6201aa", ctx, $cond(
        $ret("2141f1e1f14ee066ccdc3c0e1d6201aa", ctx, $eq(
          $ret("81c022de5b77a5bfcf95909ecf396725", ctx, $ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_première_période, ctx, params)),
          $ret("2141f1e1f14ee066ccdc3c0e1d6201aa", ctx, true))), () => $ret("c54fa131797cfa16d929dbefe2705d4a", ctx, 7.1), () => $ret("2141f1e1f14ee066ccdc3c0e1d6201aa", ctx, $cond(
          $ret("2141f1e1f14ee066ccdc3c0e1d6201aa", ctx, $eq(
            $ret("a198018c2c3085382f8d812a31739ce9", ctx, $ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_seconde_période, ctx, params)),
            $ret("2141f1e1f14ee066ccdc3c0e1d6201aa", ctx, true))), () => $ret("d7df3c5776c5e9b4146c492a46bb7a6a", ctx, 10.6), () => $ret("f36361b919e3761779b8f03ae92cddb8", ctx, 14.2)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_service_BIC(ctx, params) {
  return /** @type {number} */ (
    $ret("b465d4a69c9c7efad40845954967aa75", ctx, $cond(
      $ret("b465d4a69c9c7efad40845954967aa75", ctx, $or(
        $ret("b465d4a69c9c7efad40845954967aa75", ctx, (isNotDefined($ret("455ab90fb0893efd1496f08ea3d2e7c3", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params))))),
        () => $ret("b465d4a69c9c7efad40845954967aa75", ctx, $or(
          $ret("b465d4a69c9c7efad40845954967aa75", ctx, $eq(
            $ret("455ab90fb0893efd1496f08ea3d2e7c3", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("b465d4a69c9c7efad40845954967aa75", ctx, false))),
          () => $ret("b465d4a69c9c7efad40845954967aa75", ctx, $eq(
            $ret("455ab90fb0893efd1496f08ea3d2e7c3", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("b465d4a69c9c7efad40845954967aa75", ctx, NotApplicable))))))), () => $ret("b465d4a69c9c7efad40845954967aa75", ctx, NotApplicable), () => $ret("ce5cc74602a7156d5d052aadea6eeb07", ctx, $cond(
        $ret("ce5cc74602a7156d5d052aadea6eeb07", ctx, $eq(
          $ret("05f078fe295f70e230dd23175f84af2d", ctx, $ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_première_période, ctx, params)),
          $ret("ce5cc74602a7156d5d052aadea6eeb07", ctx, true))), () => $ret("1109f48b83e5db6741947fdbe385bd1e", ctx, 3.6), () => $ret("ce5cc74602a7156d5d052aadea6eeb07", ctx, $cond(
          $ret("ce5cc74602a7156d5d052aadea6eeb07", ctx, $eq(
            $ret("7e731dbb7b52c4a68846be682e612c3c", ctx, $ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_seconde_période, ctx, params)),
            $ret("ce5cc74602a7156d5d052aadea6eeb07", ctx, true))), () => $ret("7cd55ab5043355a34b4e7898bd67b856", ctx, 10.6), () => $ret("c82bc062339e3c445e9e9cb05ed273d7", ctx, 14.2)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_service_BNC(ctx, params) {
  return /** @type {number} */ (
    $ret("67a8251e3e8d49f11ff04c0a3d07674c", ctx, $cond(
      $ret("67a8251e3e8d49f11ff04c0a3d07674c", ctx, $or(
        $ret("67a8251e3e8d49f11ff04c0a3d07674c", ctx, (isNotDefined($ret("d308b58900d017aa5805940278cd2bd7", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params))))),
        () => $ret("67a8251e3e8d49f11ff04c0a3d07674c", ctx, $or(
          $ret("67a8251e3e8d49f11ff04c0a3d07674c", ctx, $eq(
            $ret("d308b58900d017aa5805940278cd2bd7", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("67a8251e3e8d49f11ff04c0a3d07674c", ctx, false))),
          () => $ret("67a8251e3e8d49f11ff04c0a3d07674c", ctx, $eq(
            $ret("d308b58900d017aa5805940278cd2bd7", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("67a8251e3e8d49f11ff04c0a3d07674c", ctx, NotApplicable))))))), () => $ret("67a8251e3e8d49f11ff04c0a3d07674c", ctx, NotApplicable), () => $ret("86d06295a8712e7948949e6552b510c5", ctx, $cond(
        $ret("86d06295a8712e7948949e6552b510c5", ctx, $eq(
          $ret("cdd9e7aec8f59950bad0d3b7d2104ab9", ctx, $ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_première_période, ctx, params)),
          $ret("86d06295a8712e7948949e6552b510c5", ctx, true))), () => $ret("c67190856cfd46e5e1fd40d15b95f1e2", ctx, $cond(
          $ret("c67190856cfd46e5e1fd40d15b95f1e2", ctx, $eq(
            $ret("2056d0d847e927690e05165ead1f7453", ctx, $gte(
              $ret("4e66a5da815309a718d7d21cebedd01b", ctx, $ref("date", _date, ctx, params)),
              () => $ret("7bb6b5d2746c9262b765bd7fc059118e", ctx, new Date('2026-01')))),
            $ret("c67190856cfd46e5e1fd40d15b95f1e2", ctx, true))), () => $ret("c8ea48e2b4bf79cf2821b4baf39cd8a5", ctx, 4.4), () => $ret("c67190856cfd46e5e1fd40d15b95f1e2", ctx, $cond(
            $ret("c67190856cfd46e5e1fd40d15b95f1e2", ctx, $eq(
              $ret("26f7c8a88334bcbfaaaa9677fd79648d", ctx, $gte(
                $ret("4e13405997fce4074c7c77550a627ea9", ctx, $ref("date", _date, ctx, params)),
                () => $ret("c97e3fd352638aae90a3bc01567e01e5", ctx, new Date('2025-01')))),
              $ret("c67190856cfd46e5e1fd40d15b95f1e2", ctx, true))), () => $ret("d5d6128e0d3dacd599f41fd670975d6a", ctx, 4.1), () => $ret("c67190856cfd46e5e1fd40d15b95f1e2", ctx, $cond(
              $ret("c67190856cfd46e5e1fd40d15b95f1e2", ctx, $eq(
                $ret("e2389b81ebb236a075d01aef5bf2af0c", ctx, $gte(
                  $ret("32cccc6c10714db86cf4c8db4cfc9fd9", ctx, $ref("date", _date, ctx, params)),
                  () => $ret("4a574f1e37d98e897bd693e80496c770", ctx, new Date('2024-07')))),
                $ret("c67190856cfd46e5e1fd40d15b95f1e2", ctx, true))), () => $ret("122796f74ca7117887286bf0601055f9", ctx, 3.9), () => $ret("f47b3e44106a2f9853bc81abd608aacf", ctx, 3.6))))))), () => $ret("86d06295a8712e7948949e6552b510c5", ctx, $cond(
          $ret("86d06295a8712e7948949e6552b510c5", ctx, $eq(
            $ret("d78174d6c50d3cbb02b001c9d6f6fcb2", ctx, $ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_seconde_période, ctx, params)),
            $ret("86d06295a8712e7948949e6552b510c5", ctx, true))), () => $ret("d6e1f036d17e9ea3be16193c72c5b5bc", ctx, $cond(
            $ret("d6e1f036d17e9ea3be16193c72c5b5bc", ctx, $eq(
              $ret("65dd81c48cec3a301c56a3b5008474b2", ctx, $gte(
                $ret("aa31a34537f622c10df7abf87aed07f6", ctx, $ref("date", _date, ctx, params)),
                () => $ret("f8529c2c668d56b5c10f3595e1a2c214", ctx, new Date('2026-01')))),
              $ret("d6e1f036d17e9ea3be16193c72c5b5bc", ctx, true))), () => $ret("c29cf9dd0595c8ed1093928a6705ef1f", ctx, 13.1), () => $ret("d6e1f036d17e9ea3be16193c72c5b5bc", ctx, $cond(
              $ret("d6e1f036d17e9ea3be16193c72c5b5bc", ctx, $eq(
                $ret("6a3cf5f61ec1eeabe3aa88739874614d", ctx, $gte(
                  $ret("3072847ddaa855918b3a9f54d458d27d", ctx, $ref("date", _date, ctx, params)),
                  () => $ret("a66c98c82523a425d6048810566539b2", ctx, new Date('2025-01')))),
                $ret("d6e1f036d17e9ea3be16193c72c5b5bc", ctx, true))), () => $ret("3bb36ce5b79ae8412bc5922f77733625", ctx, 12.3), () => $ret("d6e1f036d17e9ea3be16193c72c5b5bc", ctx, $cond(
                $ret("d6e1f036d17e9ea3be16193c72c5b5bc", ctx, $eq(
                  $ret("d2251f2a3ed07421666b8b734d7b3ef3", ctx, $gte(
                    $ret("c049e0066601ef36640a16e7695d9eaf", ctx, $ref("date", _date, ctx, params)),
                    () => $ret("07f71fa1dbfb0f44fea5c71ae1468b96", ctx, new Date('2024-07')))),
                  $ret("d6e1f036d17e9ea3be16193c72c5b5bc", ctx, true))), () => $ret("c285265de0926ac0a7b3a3b1b5ee6268", ctx, 11.6), () => $ret("0756e83f1fc2a0ee029a2fa5bff3d3ac", ctx, 10.6))))))), () => $ret("ec3366e173e8500036723c45537a12f9", ctx, $cond(
            $ret("ec3366e173e8500036723c45537a12f9", ctx, $eq(
              $ret("304618882b92435fc7cd9e21ebd96dc1", ctx, $gte(
                $ret("32be8f96d223b28de6370a9d4524f808", ctx, $ref("date", _date, ctx, params)),
                () => $ret("2b99f9d5ef8d90be28b09c0d6b7cd94e", ctx, new Date('2026-01')))),
              $ret("ec3366e173e8500036723c45537a12f9", ctx, true))), () => $ret("845662fad5e2ec151d4c8a07ce4122a5", ctx, 17.4), () => $ret("ec3366e173e8500036723c45537a12f9", ctx, $cond(
              $ret("ec3366e173e8500036723c45537a12f9", ctx, $eq(
                $ret("0ecf833c75a4feb2d65cb653f33f7a3b", ctx, $gte(
                  $ret("235d40ddba23c704ba260b52226b7d2f", ctx, $ref("date", _date, ctx, params)),
                  () => $ret("dce4a50cdd21498564213e5d19121de6", ctx, new Date('2025-01')))),
                $ret("ec3366e173e8500036723c45537a12f9", ctx, true))), () => $ret("c5755ce0bdf469a925297b8eea7ddc86", ctx, 16.4), () => $ret("ec3366e173e8500036723c45537a12f9", ctx, $cond(
                $ret("ec3366e173e8500036723c45537a12f9", ctx, $eq(
                  $ret("07e8647d4a0003ad51109f6afcad06ba", ctx, $gte(
                    $ret("3f3cb05ffca47110964f4a97cf0aa73d", ctx, $ref("date", _date, ctx, params)),
                    () => $ret("9120967dd92820cf1539e191bb678fcd", ctx, new Date('2024-07')))),
                  $ret("ec3366e173e8500036723c45537a12f9", ctx, true))), () => $ret("d924d265ef7979c01d2f23dcf3850d73", ctx, 15.4), () => $ret("6396e2f487255ece88a511f5dc291eb8", ctx, 14.1)))))))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_vente_restauration_hébergement(ctx, params) {
  return /** @type {number} */ (
    $ret("1743cc8d71455c89f7c79ab09cf1c118", ctx, $cond(
      $ret("1743cc8d71455c89f7c79ab09cf1c118", ctx, $or(
        $ret("1743cc8d71455c89f7c79ab09cf1c118", ctx, (isNotDefined($ret("5be33ba0c5165ad4a689e3a7ad643a16", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params))))),
        () => $ret("1743cc8d71455c89f7c79ab09cf1c118", ctx, $or(
          $ret("1743cc8d71455c89f7c79ab09cf1c118", ctx, $eq(
            $ret("5be33ba0c5165ad4a689e3a7ad643a16", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("1743cc8d71455c89f7c79ab09cf1c118", ctx, false))),
          () => $ret("1743cc8d71455c89f7c79ab09cf1c118", ctx, $eq(
            $ret("5be33ba0c5165ad4a689e3a7ad643a16", ctx, $ref("dirigeant . auto-entrepreneur . DROM", _dirigeant_·_auto__t__entrepreneur_·_DROM, ctx, params)),
            $ret("1743cc8d71455c89f7c79ab09cf1c118", ctx, NotApplicable))))))), () => $ret("1743cc8d71455c89f7c79ab09cf1c118", ctx, NotApplicable), () => $ret("a2685c5f232f7bd6fc07f0386a3ad39e", ctx, $cond(
        $ret("a2685c5f232f7bd6fc07f0386a3ad39e", ctx, $eq(
          $ret("0f9c185d83d358b39b364e203052cfec", ctx, $ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_première_période, ctx, params)),
          $ret("a2685c5f232f7bd6fc07f0386a3ad39e", ctx, true))), () => $ret("de884b4745e488a2c601cb64846b290d", ctx, 2.1), () => $ret("a2685c5f232f7bd6fc07f0386a3ad39e", ctx, $cond(
          $ret("a2685c5f232f7bd6fc07f0386a3ad39e", ctx, $eq(
            $ret("a50bbabccb855b8df3c2151e54323f50", ctx, $ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_seconde_période, ctx, params)),
            $ret("a2685c5f232f7bd6fc07f0386a3ad39e", ctx, true))), () => $ret("dd1a404c7b3d3bf9bd43d94e411f182e", ctx, 6.2), () => $ret("58ec45e599d22110806a2eb7f7809883", ctx, 8.2)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_affiliation_CIPAV(ctx, params) {
  return /** @type {boolean} */ (
    $ret("42c91c3df4d57c94519694b6e9e6e54c", ctx, $ref("dirigeant . auto-entrepreneur . Cipav", _dirigeant_·_auto__t__entrepreneur_·_Cipav, ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_chiffre_dʹaffaires(ctx, params) {
  return /** @type {number} */ (
    $ret("376cb348cf1a029076d4fc6dca9e8120", ctx, $get("dirigeant . auto-entrepreneur . chiffre d'affaires", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions(ctx, params) {
  return /** @type {number} */ (
    $ret("c6e193ef141537beb76dfd197516d2cc", ctx, $add(
      $ret("8be1b3970a4320feb3265880bbcc300a", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC, ctx, params)),
      $ret("c6e193ef141537beb76dfd197516d2cc", ctx, $add(
        $ret("6d23d31b089e44e21154fed378463c53", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . CFP", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_CFP, ctx, params)),
        $ret("e99632bd255babc438e9fe4124db937b", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations, ctx, params))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_CFP(ctx, params) {
  return /** @type {number} */ (
    $ret("9ce7239c1d490c77c2cc6ba0228400cc", ctx, $add(
      $ret("f5e2513fdb44a71ab9ecca0bb426b984", ctx, $mul(
        $ret("f5e2513fdb44a71ab9ecca0bb426b984", ctx, $mul(
          $ret("1fdb3229d034608cd0e73fe7c89c7bf9", ctx, $cond(
            $ret("1fdb3229d034608cd0e73fe7c89c7bf9", ctx, $eq(
              $ret("9118ea00e446094cf4236e7c1184da75", ctx, $and(
                $ret("0170f991dbff85c96a76388747d86be0", ctx, $lt(
                  $ret("5779f3c9becc38660d7650a6a5b7582b", ctx, $ref("date", _date, ctx, params)),
                  () => $ret("60ab268fa98fdcc23b7073b9fb659e4d", ctx, new Date('2022-01')))),
                () => $ret("9118ea00e446094cf4236e7c1184da75", ctx, $and(
                  $ret("39972548fc496821bc90a1c5cc714f6e", ctx, $eq(
                    $ret("c5936597dd06024ed19a411e47b4d5ec", ctx, $ref("dirigeant . auto-entrepreneur . Cipav", _dirigeant_·_auto__t__entrepreneur_·_Cipav, ctx, params)),
                    $ret("d7db0a5865b564e01a58b30920e8adea", ctx, false))),
                  () => $ret("9118ea00e446094cf4236e7c1184da75", ctx, true))))),
              $ret("1fdb3229d034608cd0e73fe7c89c7bf9", ctx, true))), () => $ret("a9c3014e15a590fc490e793087c0dca0", ctx, 0.1), () => $ret("73111c2756794cba0a2f9af6f4c830f5", ctx, 0.2))),
          () => $ret("8d96c6dcc578fb4e4a9df00fd1006226", ctx, $ref("entreprise . chiffre d'affaires . service BNC", _entreprise_·_chiffre_dʹaffaires_·_service_BNC, ctx, params)))),
        () => $ret("f5e2513fdb44a71ab9ecca0bb426b984", ctx, 0.01))),
      $ret("329dbe6c35ae0af8c2eee50001050cba", ctx, $mul(
        $ret("329dbe6c35ae0af8c2eee50001050cba", ctx, $mul(
          $ret("1ca9500402d09d7298d157d610b0e172", ctx, $cond(
            $ret("1ca9500402d09d7298d157d610b0e172", ctx, $eq(
              $ret("7d674080c19ed1d71c106039b61cdf07", ctx, $eq(
                $ret("1a0186160a35463c9af72803db019f04", ctx, $ref("entreprise . activité . nature", _entreprise_·_activité_·_nature, ctx, params)),
                $ret("923e2ba39c6784013858ec96147e6945", ctx, "artisanale"))),
              $ret("1ca9500402d09d7298d157d610b0e172", ctx, true))), () => $ret("24daa6335caf0d1d6db8c79b0f61b51e", ctx, 0.3), () => $ret("06dae9f5e98eb5e99feb81a44b65cc05", ctx, 0.1))),
          () => $ret("20e75f6cb5ee3bd33295c44ebbf8a0da", ctx, $ref("entreprise . chiffre d'affaires . BIC", _entreprise_·_chiffre_dʹaffaires_·_BIC, ctx, params)))),
        () => $ret("329dbe6c35ae0af8c2eee50001050cba", ctx, 0.01)))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC(ctx, params) {
  return /** @type {number} */ (
    $ret("fdd33d24d2f7a65158e3ff4c92cfbc88", ctx, $add(
      $ret("b10b85d71a0df1c2b31a680433f8628c", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers, ctx, params)),
      $ret("89bf4502ee4543044c704b8533aa1a3e", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_commerce, ctx, params))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_commerce(ctx, params) {
  return /** @type {number} */ (
    $ret("23afede30abc71a6f65af72c5522279d", ctx, $cond(
      $ret("23afede30abc71a6f65af72c5522279d", ctx, $or(
        $ret("23afede30abc71a6f65af72c5522279d", ctx, (isNotDefined($ret("c10a4791bd25c90d2f2a8d429819062a", ctx, $eq(
          $ret("0d8d8fc2ff58af3791eeefec3d561bf1", ctx, $ref("entreprise . activité . nature", _entreprise_·_activité_·_nature, ctx, params)),
          $ret("8bf1a10814f50ebdf39a1db832a8bfbc", ctx, "commerciale")))))),
        () => $ret("23afede30abc71a6f65af72c5522279d", ctx, $or(
          $ret("23afede30abc71a6f65af72c5522279d", ctx, $eq(
            $ret("c10a4791bd25c90d2f2a8d429819062a", ctx, $eq(
              $ret("0d8d8fc2ff58af3791eeefec3d561bf1", ctx, $ref("entreprise . activité . nature", _entreprise_·_activité_·_nature, ctx, params)),
              $ret("8bf1a10814f50ebdf39a1db832a8bfbc", ctx, "commerciale"))),
            $ret("23afede30abc71a6f65af72c5522279d", ctx, false))),
          () => $ret("23afede30abc71a6f65af72c5522279d", ctx, $eq(
            $ret("c10a4791bd25c90d2f2a8d429819062a", ctx, $eq(
              $ret("0d8d8fc2ff58af3791eeefec3d561bf1", ctx, $ref("entreprise . activité . nature", _entreprise_·_activité_·_nature, ctx, params)),
              $ret("8bf1a10814f50ebdf39a1db832a8bfbc", ctx, "commerciale"))),
            $ret("23afede30abc71a6f65af72c5522279d", ctx, NotApplicable))))))), () => $ret("23afede30abc71a6f65af72c5522279d", ctx, NotApplicable), () => $ret("2babd145185260305b85f1ddd50e4954", ctx, $add(
        $ret("6ba5f9d3a21a465600d30e211662e6bd", ctx, $round("nearest", $ret("6ba5f9d3a21a465600d30e211662e6bd", ctx, $mul(
          $ret("6ba5f9d3a21a465600d30e211662e6bd", ctx, $mul(
            $ret("2c06258510c5be70cc62e78ff83d6b85", ctx, 0.015),
            () => $ret("e47a64176e7a69d724096b3415bbb4a5", ctx, $ref("entreprise . chiffre d'affaires . vente restauration hébergement", _entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergement, ctx, params)))),
          () => $ret("6ba5f9d3a21a465600d30e211662e6bd", ctx, 0.01))), () => $ret("fdfd8805926293b9d91c0857c8e38ffa", ctx, $cond(
          $ret("fdfd8805926293b9d91c0857c8e38ffa", ctx, true), () => $ret("fdfd8805926293b9d91c0857c8e38ffa", ctx, 1.), () => $ret("fdfd8805926293b9d91c0857c8e38ffa", ctx, NotApplicable))))),
        $ret("fbac4f6153331a9dce63e3c9c22a2501", ctx, $round("nearest", $ret("fbac4f6153331a9dce63e3c9c22a2501", ctx, $mul(
          $ret("fbac4f6153331a9dce63e3c9c22a2501", ctx, $mul(
            $ret("33bf485a99b81065b98424232cce39cd", ctx, 0.044),
            () => $ret("f022a465b83d2d7c71b56f6b82dadd43", ctx, $ref("entreprise . chiffre d'affaires . service BIC", _entreprise_·_chiffre_dʹaffaires_·_service_BIC, ctx, params)))),
          () => $ret("fbac4f6153331a9dce63e3c9c22a2501", ctx, 0.01))), () => $ret("89867f8e25fd6e567c63233d350a06ff", ctx, $cond(
          $ret("89867f8e25fd6e567c63233d350a06ff", ctx, true), () => $ret("89867f8e25fd6e567c63233d350a06ff", ctx, 1.), () => $ret("89867f8e25fd6e567c63233d350a06ff", ctx, NotApplicable)))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers(ctx, params) {
  return /** @type {number} */ (
    $ret("90bbb21d8462898a79575434f6ca2014", ctx, $cond(
      $ret("90bbb21d8462898a79575434f6ca2014", ctx, $or(
        $ret("90bbb21d8462898a79575434f6ca2014", ctx, (isNotDefined($ret("24c56810ce068643e05a0d6be6e3e175", ctx, $eq(
          $ret("b2ccdffaa30224c303129e94b2cd08be", ctx, $ref("entreprise . activité . nature", _entreprise_·_activité_·_nature, ctx, params)),
          $ret("c649ac616a28c411a1cfcb7a0428f4ec", ctx, "artisanale")))))),
        () => $ret("90bbb21d8462898a79575434f6ca2014", ctx, $or(
          $ret("90bbb21d8462898a79575434f6ca2014", ctx, $eq(
            $ret("24c56810ce068643e05a0d6be6e3e175", ctx, $eq(
              $ret("b2ccdffaa30224c303129e94b2cd08be", ctx, $ref("entreprise . activité . nature", _entreprise_·_activité_·_nature, ctx, params)),
              $ret("c649ac616a28c411a1cfcb7a0428f4ec", ctx, "artisanale"))),
            $ret("90bbb21d8462898a79575434f6ca2014", ctx, false))),
          () => $ret("90bbb21d8462898a79575434f6ca2014", ctx, $eq(
            $ret("24c56810ce068643e05a0d6be6e3e175", ctx, $eq(
              $ret("b2ccdffaa30224c303129e94b2cd08be", ctx, $ref("entreprise . activité . nature", _entreprise_·_activité_·_nature, ctx, params)),
              $ret("c649ac616a28c411a1cfcb7a0428f4ec", ctx, "artisanale"))),
            $ret("90bbb21d8462898a79575434f6ca2014", ctx, NotApplicable))))))), () => $ret("90bbb21d8462898a79575434f6ca2014", ctx, NotApplicable), () => $ret("f8136137b8effca5f78d3f26d495ad7c", ctx, $add(
        $ret("487670abf0bb63049adb2f90d6184fd6", ctx, $round("nearest", $ret("487670abf0bb63049adb2f90d6184fd6", ctx, $mul(
          $ret("487670abf0bb63049adb2f90d6184fd6", ctx, $mul(
            $ret("d6a560822ff4be1c016ebfaab726a879", ctx, $cond(
              $ret("d6a560822ff4be1c016ebfaab726a879", ctx, $neq(
                $ret("d6a560822ff4be1c016ebfaab726a879", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux vente", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Moselle_·_taux_vente, ctx, params)),
                $ret("d6a560822ff4be1c016ebfaab726a879", ctx, NotApplicable))), () => $ret("d6a560822ff4be1c016ebfaab726a879", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux vente", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Moselle_·_taux_vente, ctx, params)), () => $ret("d6a560822ff4be1c016ebfaab726a879", ctx, $cond(
                $ret("d6a560822ff4be1c016ebfaab726a879", ctx, $neq(
                  $ret("d6a560822ff4be1c016ebfaab726a879", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux vente", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Alsace_·_taux_vente, ctx, params)),
                  $ret("d6a560822ff4be1c016ebfaab726a879", ctx, NotApplicable))), () => $ret("d6a560822ff4be1c016ebfaab726a879", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux vente", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Alsace_·_taux_vente, ctx, params)), () => $ret("d6a560822ff4be1c016ebfaab726a879", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_vente, ctx, params)))))),
            () => $ret("87fae969ccd5671f41d19340b523efe1", ctx, $ref("entreprise . chiffre d'affaires . vente restauration hébergement", _entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergement, ctx, params)))),
          () => $ret("487670abf0bb63049adb2f90d6184fd6", ctx, 0.01))), () => $ret("e698106b2826fbba3a750e27cc45a02e", ctx, $cond(
          $ret("e698106b2826fbba3a750e27cc45a02e", ctx, true), () => $ret("e698106b2826fbba3a750e27cc45a02e", ctx, 1.), () => $ret("e698106b2826fbba3a750e27cc45a02e", ctx, NotApplicable))))),
        $ret("6fb90414a167a73a549c2a9c1b3f8b2c", ctx, $round("nearest", $ret("6fb90414a167a73a549c2a9c1b3f8b2c", ctx, $mul(
          $ret("6fb90414a167a73a549c2a9c1b3f8b2c", ctx, $mul(
            $ret("c936691a023046211ca3af68e13638c6", ctx, $cond(
              $ret("c936691a023046211ca3af68e13638c6", ctx, $neq(
                $ret("c936691a023046211ca3af68e13638c6", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux service", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Moselle_·_taux_service, ctx, params)),
                $ret("c936691a023046211ca3af68e13638c6", ctx, NotApplicable))), () => $ret("c936691a023046211ca3af68e13638c6", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux service", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Moselle_·_taux_service, ctx, params)), () => $ret("c936691a023046211ca3af68e13638c6", ctx, $cond(
                $ret("c936691a023046211ca3af68e13638c6", ctx, $neq(
                  $ret("c936691a023046211ca3af68e13638c6", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux service", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Alsace_·_taux_service, ctx, params)),
                  $ret("c936691a023046211ca3af68e13638c6", ctx, NotApplicable))), () => $ret("c936691a023046211ca3af68e13638c6", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux service", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Alsace_·_taux_service, ctx, params)), () => $ret("c936691a023046211ca3af68e13638c6", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux service", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_service, ctx, params)))))),
            () => $ret("cb1fd1e4ac5bf5d99a0b64dacbb4106d", ctx, $ref("entreprise . chiffre d'affaires . service BIC", _entreprise_·_chiffre_dʹaffaires_·_service_BIC, ctx, params)))),
          () => $ret("6fb90414a167a73a549c2a9c1b3f8b2c", ctx, 0.01))), () => $ret("619e7ba2b25472f595418f26c44f868a", ctx, $cond(
          $ret("619e7ba2b25472f595418f26c44f868a", ctx, true), () => $ret("619e7ba2b25472f595418f26c44f868a", ctx, 1.), () => $ret("619e7ba2b25472f595418f26c44f868a", ctx, NotApplicable)))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Alsace(ctx, params) {
  return /** @type {boolean} */ (
    $ret("c2797fcee5cb96877c901d8e83f689f2", ctx, $cond(
      $ret("c2797fcee5cb96877c901d8e83f689f2", ctx, (isNotDefined($ret("878bf8e35466a33b1a28b742e9e83706", ctx, $or(
        $ret("9a833acd239f076c696c2c8cccb1e4d3", ctx, $eq(
          $ret("8fe77ff5ded9255d23de8da23d80104b", ctx, $ref("établissement . commune . département", _établissement_·_commune_·_département, ctx, params)),
          $ret("9deb41c67c353d578880d7b2033915ee", ctx, "Bas-Rhin"))),
        () => $ret("878bf8e35466a33b1a28b742e9e83706", ctx, $or(
          $ret("ff453423de6395ffad602e0c4be5964d", ctx, $eq(
            $ret("de7c491e4874c7636d856ce27d95a377", ctx, $ref("établissement . commune . département", _établissement_·_commune_·_département, ctx, params)),
            $ret("a88b924bc3ed8ac7836abb0273b2d5bf", ctx, "Haut-Rhin"))),
          () => $ret("878bf8e35466a33b1a28b742e9e83706", ctx, false)))))))), () => $ret("27485f7dad85822ea9a493126fba5b7a", ctx, false), () => $ret("878bf8e35466a33b1a28b742e9e83706", ctx, $or(
        $ret("9a833acd239f076c696c2c8cccb1e4d3", ctx, $eq(
          $ret("8fe77ff5ded9255d23de8da23d80104b", ctx, $ref("établissement . commune . département", _établissement_·_commune_·_département, ctx, params)),
          $ret("9deb41c67c353d578880d7b2033915ee", ctx, "Bas-Rhin"))),
        () => $ret("878bf8e35466a33b1a28b742e9e83706", ctx, $or(
          $ret("ff453423de6395ffad602e0c4be5964d", ctx, $eq(
            $ret("de7c491e4874c7636d856ce27d95a377", ctx, $ref("établissement . commune . département", _établissement_·_commune_·_département, ctx, params)),
            $ret("a88b924bc3ed8ac7836abb0273b2d5bf", ctx, "Haut-Rhin"))),
          () => $ret("878bf8e35466a33b1a28b742e9e83706", ctx, false)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Alsace_·_taux_service(ctx, params) {
  return /** @type {number} */ (
    $ret("61909c0e309571c76cdb2617e6c19ca1", ctx, 0.65)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Alsace_·_taux_vente(ctx, params) {
  return /** @type {number} */ (
    $ret("11fc161a9e99405fc306b93de224f0e9", ctx, 0.29)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Moselle(ctx, params) {
  return /** @type {boolean} */ (
    $ret("c050490aea9092253582d8b54deb24c2", ctx, $cond(
      $ret("c050490aea9092253582d8b54deb24c2", ctx, (isNotDefined($ret("f28a23ae7b6aa59e9b135e18c2648a2c", ctx, $eq(
        $ret("db3888f26e03cad41fee50d5f1b1272e", ctx, $ref("établissement . commune . département", _établissement_·_commune_·_département, ctx, params)),
        $ret("a570ffb0fdc1d5576f87f5deacc044cf", ctx, "Moselle")))))), () => $ret("9f3144a98a1550cc8b6cb81626f3ef75", ctx, false), () => $ret("f28a23ae7b6aa59e9b135e18c2648a2c", ctx, $eq(
        $ret("db3888f26e03cad41fee50d5f1b1272e", ctx, $ref("établissement . commune . département", _établissement_·_commune_·_département, ctx, params)),
        $ret("a570ffb0fdc1d5576f87f5deacc044cf", ctx, "Moselle")))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Moselle_·_taux_service(ctx, params) {
  return /** @type {number} */ (
    $ret("25f70aa788fed917963c8c0005c1852e", ctx, 0.83)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_Moselle_·_taux_vente(ctx, params) {
  return /** @type {number} */ (
    $ret("11f9c14d27f370a0fc8680a7b7b52f80", ctx, 0.37)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_service(ctx, params) {
  return /** @type {number} */ (
    $ret("c314ef2e94574cf11464a9b3bdc1ea7e", ctx, 0.48)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC_·_métiers_·_taux_vente(ctx, params) {
  return /** @type {number} */ (
    $ret("f0abd7b2bfebb4af3ba8103d9ffc8299", ctx, 0.22)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations(ctx, params) {
  return /** @type {number} */ (
    $ret("4907a64166410761fc5e3608b154ae7f", ctx, $add(
      $ret("10f57f73795ed8fe372df15dfef7c4bb", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC, ctx, params)),
      $ret("4907a64166410761fc5e3608b154ae7f", ctx, $add(
        $ret("8fc44cfc1af02b9d30d6e417e7985194", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement, ctx, params)),
        $ret("4907a64166410761fc5e3608b154ae7f", ctx, $add(
          $ret("c90b0bb12a009994421ada6e36db6892", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav, ctx, params)),
          $ret("d28b4727dd5e72ec2cb6a43577745d3b", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC, ctx, params))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_répartition(ctx, params) {
  return /** @type {unknown} */ (
    $ret("7e869b4a3bd6cbfbec091a89380aac1a", ctx, $get("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_répartition_·_autres_contributions(ctx, params) {
  return /** @type {number} */ (
    $ret("a195e9f72c8fa1e76e725c469c9c037d", ctx, $add(
      $ret("5b7866e9987bdde02d945c914253a76e", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_autres_contributions, ctx, params)),
      $ret("a195e9f72c8fa1e76e725c469c9c037d", ctx, $add(
        $ret("175fbfd241f1b92e5c23ec8a1549b662", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_autres_contributions, ctx, params)),
        $ret("a195e9f72c8fa1e76e725c469c9c037d", ctx, $add(
          $ret("f2cabba7592e23246ece5730cc39359f", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_autres_contributions, ctx, params)),
          $ret("72821b236363d11e09dc516a7f68d633", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_autres_contributions, ctx, params))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_répartition_·_formation_professionnelle(ctx, params) {
  return /** @type {number} */ (
    $ret("c00f08b3c4ef491814e5d5b82fbee8ba", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . CFP", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_CFP, ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_répartition_·_invalidité__t__décès(ctx, params) {
  return /** @type {number} */ (
    $ret("a2b3e91a340a6ac079206148d4de1157", ctx, $add(
      $ret("26fa07dce21b8ac6fbac5e985d966136", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_invalidité__t__décès, ctx, params)),
      $ret("a2b3e91a340a6ac079206148d4de1157", ctx, $add(
        $ret("63b986939d6ddadbaf609794cb392158", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_invalidité__t__décès, ctx, params)),
        $ret("a2b3e91a340a6ac079206148d4de1157", ctx, $add(
          $ret("10d789348a62752d89a157d90b6d1057", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_invalidité__t__décès, ctx, params)),
          $ret("6c1b0ef8a9129e0c2686121d36e048b7", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_invalidité__t__décès, ctx, params))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_répartition_·_maladie__t__maternité(ctx, params) {
  return /** @type {number} */ (
    $ret("0381c144a6a75dd44228c663dc64e854", ctx, $add(
      $ret("be73538cdf9c2f3e23ef9fd68121fd8d", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_maladie__t__maternité, ctx, params)),
      $ret("0381c144a6a75dd44228c663dc64e854", ctx, $add(
        $ret("0c26c5a85f429f50dd260bfa84254b00", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_maladie__t__maternité, ctx, params)),
        $ret("0381c144a6a75dd44228c663dc64e854", ctx, $add(
          $ret("47af0c322d2cbd9fa6bf20d713e0fefc", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_maladie__t__maternité, ctx, params)),
          $ret("726cd41aeeefec8a08f746e5a02cd325", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_maladie__t__maternité, ctx, params))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_répartition_·_retraite(ctx, params) {
  return /** @type {number} */ (
    $ret("e686394687f75c372a4639aa4d66c86a", ctx, $add(
      $ret("6e2144bc9f1448297b23a03a5b86a99c", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_répartition_·_retraite_complémentaire, ctx, params)),
      $ret("37a14bdafae4695b255d98973d9246a3", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_répartition_·_retraite_de_base, ctx, params))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_répartition_·_retraite_complémentaire(ctx, params) {
  return /** @type {number} */ (
    $ret("d1b2951f11c82f149c59a7bbe53f7da6", ctx, $add(
      $ret("85e11b05819f022e79c6c8e7eec547bc", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_retraite_complémentaire, ctx, params)),
      $ret("d1b2951f11c82f149c59a7bbe53f7da6", ctx, $add(
        $ret("99d6972a58d8c9430413be1d0411d334", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_retraite_complémentaire, ctx, params)),
        $ret("d1b2951f11c82f149c59a7bbe53f7da6", ctx, $add(
          $ret("4713878d1a2df550a9c761469da4ecf3", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_retraite_complémentaire, ctx, params)),
          $ret("7709a453b834d98c8a2b942deac5e144", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_retraite_complémentaire, ctx, params))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_répartition_·_retraite_de_base(ctx, params) {
  return /** @type {number} */ (
    $ret("3c70a3543d67ecd602117d7f4fcb0efa", ctx, $add(
      $ret("db11d123c29002b532f9b91c632d35fa", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_retraite_de_base, ctx, params)),
      $ret("3c70a3543d67ecd602117d7f4fcb0efa", ctx, $add(
        $ret("7509de952a0949bdbf0e3eb836653ab9", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_retraite_de_base, ctx, params)),
        $ret("3c70a3543d67ecd602117d7f4fcb0efa", ctx, $add(
          $ret("e4d6ac0c558529422f03b979f0718926", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_retraite_de_base, ctx, params)),
          $ret("7c828f9624fcc111177e75ce39b1505c", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_retraite_de_base, ctx, params))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC(ctx, params) {
  return /** @type {number} */ (
    $ret("a5e3b94bb1440ad91a3d050ccb66dfc7", ctx, $mul(
      $ret("a5e3b94bb1440ad91a3d050ccb66dfc7", ctx, $mul(
        $ret("b6e24f1e01525f48506ef5de7f238127", ctx, $cond(
          $ret("b6e24f1e01525f48506ef5de7f238127", ctx, $neq(
            $ret("b6e24f1e01525f48506ef5de7f238127", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux service BIC", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_service_BIC, ctx, params)),
            $ret("b6e24f1e01525f48506ef5de7f238127", ctx, NotApplicable))), () => $ret("b6e24f1e01525f48506ef5de7f238127", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux service BIC", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_service_BIC, ctx, params)), () => $ret("b6e24f1e01525f48506ef5de7f238127", ctx, $cond(
            $ret("b6e24f1e01525f48506ef5de7f238127", ctx, $neq(
              $ret("b6e24f1e01525f48506ef5de7f238127", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux service BIC", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_service_BIC, ctx, params)),
              $ret("b6e24f1e01525f48506ef5de7f238127", ctx, NotApplicable))), () => $ret("b6e24f1e01525f48506ef5de7f238127", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux service BIC", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_service_BIC, ctx, params)), () => $ret("b6e24f1e01525f48506ef5de7f238127", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_taux, ctx, params)))))),
        () => $ret("9814e5ca6dd0202d38f80abfd1018f53", ctx, $ref("entreprise . chiffre d'affaires . service BIC", _entreprise_·_chiffre_dʹaffaires_·_service_BIC, ctx, params)))),
      () => $ret("a5e3b94bb1440ad91a3d050ccb66dfc7", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition(ctx, params) {
  return /** @type {unknown} */ (
    $ret("31a820fef41b71073c7ed80309d6e09c", ctx, $get("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_autres_contributions(ctx, params) {
  return /** @type {number} */ (
    $ret("ed95f4cc88c84b30167849815679fb05", ctx, $mul(
      $ret("ed95f4cc88c84b30167849815679fb05", ctx, $mul(
        $ret("abbf5615df0a275067656e2c285d3c3c", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC, ctx, params)),
        () => $ret("e3a6be5740520eb59751ecad3d65236d", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_autres_contributions_·_taux_de_répartition, ctx, params)))),
      () => $ret("ed95f4cc88c84b30167849815679fb05", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_autres_contributions_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("3b7ec6f3990cafd7f5220a383a435379", ctx, 29.7)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_invalidité__t__décès(ctx, params) {
  return /** @type {number} */ (
    $ret("52e0aec16753d9739c72e2fd8c227a12", ctx, $mul(
      $ret("52e0aec16753d9739c72e2fd8c227a12", ctx, $mul(
        $ret("884b23c289684e49494a015715816a96", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC, ctx, params)),
        () => $ret("a293ce0b691e7fde8b87955cd31af9ad", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_invalidité__t__décès_·_taux_de_répartition, ctx, params)))),
      () => $ret("52e0aec16753d9739c72e2fd8c227a12", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_invalidité__t__décès_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("5f1aaaf0111c7f6e692effb03e414442", ctx, 3.1)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_maladie__t__maternité(ctx, params) {
  return /** @type {number} */ (
    $ret("0a668c5389c0fb66569f4bdcb849b040", ctx, $mul(
      $ret("0a668c5389c0fb66569f4bdcb849b040", ctx, $mul(
        $ret("83cf98b7d0764b4398cf58279d7624d7", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC, ctx, params)),
        () => $ret("8441ff2c2faef17e700dfb7774d0867c", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_maladie__t__maternité_·_taux_de_répartition, ctx, params)))),
      () => $ret("0a668c5389c0fb66569f4bdcb849b040", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_maladie__t__maternité_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("64e1e37070cbc15f1f1e5c97bdec207b", ctx, 8.9)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_retraite_complémentaire(ctx, params) {
  return /** @type {number} */ (
    $ret("b5ef216099a37fb2608f1e6f964832a6", ctx, $mul(
      $ret("b5ef216099a37fb2608f1e6f964832a6", ctx, $mul(
        $ret("ec3b9893377bef2f7f570b02aff17739", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC, ctx, params)),
        () => $ret("683c499d53090c5384bdd430a0899028", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_retraite_complémentaire_·_taux_de_répartition, ctx, params)))),
      () => $ret("b5ef216099a37fb2608f1e6f964832a6", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_retraite_complémentaire_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("325bdca0f3fbc45d88009171d3b20ce2", ctx, 16.5)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_retraite_de_base(ctx, params) {
  return /** @type {number} */ (
    $ret("10bf91f5d1ec3f97d322132d470807ea", ctx, $mul(
      $ret("10bf91f5d1ec3f97d322132d470807ea", ctx, $mul(
        $ret("e39d2dc59934e9a7fb532d24cd91431a", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC, ctx, params)),
        () => $ret("fc7a6cbf85908770d6e435b50fd03e5d", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_retraite_de_base_·_taux_de_répartition, ctx, params)))),
      () => $ret("10bf91f5d1ec3f97d322132d470807ea", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_répartition_·_retraite_de_base_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("b7fdef0f9c56de0c10350e92bb5370b0", ctx, 41.8)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BIC_·_taux(ctx, params) {
  return /** @type {number} */ (
    $ret("7ae82f94c9a5afce5cf4bffe2920dc5b", ctx, $cond(
      $ret("7ae82f94c9a5afce5cf4bffe2920dc5b", ctx, $eq(
        $ret("5d160158d37e95277ea3daedf6acc524", ctx, $gte(
          $ret("8c989cc2ee84652777d83f878c12f222", ctx, $ref("date", _date, ctx, params)),
          () => $ret("6327869e01a66e3ab5ecb88bae7f2a47", ctx, new Date('2022-10')))),
        $ret("7ae82f94c9a5afce5cf4bffe2920dc5b", ctx, true))), () => $ret("1bbf4fd614aa7882a3d2a6812da79425", ctx, 21.2), () => $ret("13a89a9c792ebf11f64426519dd8c4a0", ctx, 22.)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC(ctx, params) {
  return /** @type {number} */ (
    $ret("27241ceb83519448896e24ab732f762d", ctx, $cond(
      $ret("27241ceb83519448896e24ab732f762d", ctx, $or(
        $ret("27241ceb83519448896e24ab732f762d", ctx, (isNotDefined($ret("dd660facccc10443b9e06966913eeeed", ctx, $gt(
          $ret("54928c064edcc1d9a776591deebd6ac1", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav, ctx, params)),
          () => $ret("95f0105d335c63f10d33f197497e60eb", ctx, 0.)))))),
        () => $ret("27241ceb83519448896e24ab732f762d", ctx, $or(
          $ret("27241ceb83519448896e24ab732f762d", ctx, $eq(
            $ret("dd660facccc10443b9e06966913eeeed", ctx, $gt(
              $ret("54928c064edcc1d9a776591deebd6ac1", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav, ctx, params)),
              () => $ret("95f0105d335c63f10d33f197497e60eb", ctx, 0.))),
            $ret("27241ceb83519448896e24ab732f762d", ctx, false))),
          () => $ret("27241ceb83519448896e24ab732f762d", ctx, $eq(
            $ret("dd660facccc10443b9e06966913eeeed", ctx, $gt(
              $ret("54928c064edcc1d9a776591deebd6ac1", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav, ctx, params)),
              () => $ret("95f0105d335c63f10d33f197497e60eb", ctx, 0.))),
            $ret("27241ceb83519448896e24ab732f762d", ctx, NotApplicable))))))), () => $ret("4175dd662bae62c61d34ef4a84fa5804", ctx, $mul(
        $ret("4175dd662bae62c61d34ef4a84fa5804", ctx, $mul(
          $ret("6b823bde52fd379c582bd70960076b43", ctx, $cond(
            $ret("6b823bde52fd379c582bd70960076b43", ctx, $neq(
              $ret("6b823bde52fd379c582bd70960076b43", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux service BNC", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_service_BNC, ctx, params)),
              $ret("6b823bde52fd379c582bd70960076b43", ctx, NotApplicable))), () => $ret("6b823bde52fd379c582bd70960076b43", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux service BNC", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_service_BNC, ctx, params)), () => $ret("6b823bde52fd379c582bd70960076b43", ctx, $cond(
              $ret("6b823bde52fd379c582bd70960076b43", ctx, $neq(
                $ret("6b823bde52fd379c582bd70960076b43", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux service BNC", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_service_BNC, ctx, params)),
                $ret("6b823bde52fd379c582bd70960076b43", ctx, NotApplicable))), () => $ret("6b823bde52fd379c582bd70960076b43", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux service BNC", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_service_BNC, ctx, params)), () => $ret("6b823bde52fd379c582bd70960076b43", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_taux, ctx, params)))))),
          () => $ret("6ae36ff83eceac12c231abf77c0aef96", ctx, $ref("entreprise . chiffre d'affaires . service BNC", _entreprise_·_chiffre_dʹaffaires_·_service_BNC, ctx, params)))),
        () => $ret("4175dd662bae62c61d34ef4a84fa5804", ctx, 0.01))), () => $ret("27241ceb83519448896e24ab732f762d", ctx, NotApplicable)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition(ctx, params) {
  return /** @type {unknown} */ (
    $ret("5bb1eca20f64fc17235387af900e87ea", ctx, $get("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_autres_contributions(ctx, params) {
  return /** @type {number} */ (
    $ret("cf820473bab3ff005a195a2126b43872", ctx, $mul(
      $ret("cf820473bab3ff005a195a2126b43872", ctx, $mul(
        $ret("71e8794032c4a8d142a2395fdd8ef2ae", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC, ctx, params)),
        () => $ret("bbbf829782e5f158a371e4ada5d14a52", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_autres_contributions_·_taux_de_répartition, ctx, params)))),
      () => $ret("cf820473bab3ff005a195a2126b43872", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_autres_contributions_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("8c416b696e27ff6852b64895aab38572", ctx, $cond(
      $ret("8c416b696e27ff6852b64895aab38572", ctx, $eq(
        $ret("5f5fdbdcf8e4d3ae3c6528accc394d75", ctx, $gte(
          $ret("77b33d6551340e553bc2a8c6685836ff", ctx, $ref("date", _date, ctx, params)),
          () => $ret("966e70541098e587d030d5c88b5d6de0", ctx, new Date('2026-01')))),
        $ret("8c416b696e27ff6852b64895aab38572", ctx, true))), () => $ret("543a2025139e4f15ae85ca5c7a7c4e6b", ctx, 31.2), () => $ret("8c416b696e27ff6852b64895aab38572", ctx, $cond(
        $ret("8c416b696e27ff6852b64895aab38572", ctx, $eq(
          $ret("f43923f503ff7ddd50c67ea02f157cd7", ctx, $gte(
            $ret("86d6e74ceaa595ed89ffd78228be1acf", ctx, $ref("date", _date, ctx, params)),
            () => $ret("b42a5e37909977b9b14c57b0a46dcbd2", ctx, new Date('2025-01')))),
          $ret("8c416b696e27ff6852b64895aab38572", ctx, true))), () => $ret("6f8d56c80e7814a22571d614729c6ad8", ctx, 32.5), () => $ret("8c416b696e27ff6852b64895aab38572", ctx, $cond(
          $ret("8c416b696e27ff6852b64895aab38572", ctx, $eq(
            $ret("130015e5efc66a565e18e052c96f9569", ctx, $gte(
              $ret("86ab6575ca5efc46a6477dd82ac2e0f6", ctx, $ref("date", _date, ctx, params)),
              () => $ret("65ca05146c058d6c1e08acc55f37f5b5", ctx, new Date('2024-07')))),
            $ret("8c416b696e27ff6852b64895aab38572", ctx, true))), () => $ret("756ebb2a925aa7741a67aac588615f1e", ctx, 34.1), () => $ret("ffb4ee790c03243b9c59f59d5804f8bc", ctx, 36.5)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_invalidité__t__décès(ctx, params) {
  return /** @type {number} */ (
    $ret("1df413d970fae6b4e0385600603edccc", ctx, $mul(
      $ret("1df413d970fae6b4e0385600603edccc", ctx, $mul(
        $ret("57f778768d6e7c9e1379afaac9ddfcc7", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC, ctx, params)),
        () => $ret("ed212e5f7b2c5194e544262ef04be57f", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_invalidité__t__décès_·_taux_de_répartition, ctx, params)))),
      () => $ret("1df413d970fae6b4e0385600603edccc", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_invalidité__t__décès_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("e65a609ef314fd07dfc37abf723fa6bb", ctx, $cond(
      $ret("e65a609ef314fd07dfc37abf723fa6bb", ctx, $eq(
        $ret("2c64e9758c60e960aa4bfa0a3e50c904", ctx, $gte(
          $ret("a403cbcc6ea9643c544a3454b54e1630", ctx, $ref("date", _date, ctx, params)),
          () => $ret("306e4c5b4a90449307a39cec1d01b4b8", ctx, new Date('2026-01')))),
        $ret("e65a609ef314fd07dfc37abf723fa6bb", ctx, true))), () => $ret("8728f3746cb4a8fcc167c7a60255c823", ctx, 3.25), () => $ret("e65a609ef314fd07dfc37abf723fa6bb", ctx, $cond(
        $ret("e65a609ef314fd07dfc37abf723fa6bb", ctx, $eq(
          $ret("1eba7ee4ceffec5c301aa3804e8527b3", ctx, $gte(
            $ret("051d0cd82836bdf4c9366cb4299f2cc5", ctx, $ref("date", _date, ctx, params)),
            () => $ret("7930867b0b335da8f8e39abc4466f1f7", ctx, new Date('2025-01')))),
          $ret("e65a609ef314fd07dfc37abf723fa6bb", ctx, true))), () => $ret("b7d56a7b88b1db757d36a5bdffa72e62", ctx, 3.5), () => $ret("e65a609ef314fd07dfc37abf723fa6bb", ctx, $cond(
          $ret("e65a609ef314fd07dfc37abf723fa6bb", ctx, $eq(
            $ret("fa6efd85fbc9d6b5be129b1cdf95b600", ctx, $gte(
              $ret("0b4f0ae5ac3e35bccc9f8dcd0b10b2d5", ctx, $ref("date", _date, ctx, params)),
              () => $ret("349091e04bf49707bba2016d7562ffa1", ctx, new Date('2024-07')))),
            $ret("e65a609ef314fd07dfc37abf723fa6bb", ctx, true))), () => $ret("97295f6a88185c6eae860e67c59a3bf4", ctx, 3.7), () => $ret("354f5b02bb7321ea68cdb9bea8d14f6a", ctx, 4.1)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_maladie__t__maternité(ctx, params) {
  return /** @type {number} */ (
    $ret("68db61ca28517cf4d83fd7dd986c2307", ctx, $mul(
      $ret("68db61ca28517cf4d83fd7dd986c2307", ctx, $mul(
        $ret("ae9ba157a668c97cfa5698b265e94244", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC, ctx, params)),
        () => $ret("105e9d8979b11bdf3560c2a40d015f26", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_maladie__t__maternité_·_taux_de_répartition, ctx, params)))),
      () => $ret("68db61ca28517cf4d83fd7dd986c2307", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_maladie__t__maternité_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("bb0ed0f6b269d055b6f71aee8e51860a", ctx, $cond(
      $ret("bb0ed0f6b269d055b6f71aee8e51860a", ctx, $eq(
        $ret("4c46388f2a891686a4b11112e28ccaf2", ctx, $gte(
          $ret("70010dc2f5270c5cc04c585e0b984513", ctx, $ref("date", _date, ctx, params)),
          () => $ret("dd9e6cf5c8175e3eeb7b04f32d91b9fb", ctx, new Date('2026-01')))),
        $ret("bb0ed0f6b269d055b6f71aee8e51860a", ctx, true))), () => $ret("0da9e26f53764556d6ef5917624107e2", ctx, 3.), () => $ret("bb0ed0f6b269d055b6f71aee8e51860a", ctx, $cond(
        $ret("bb0ed0f6b269d055b6f71aee8e51860a", ctx, $eq(
          $ret("86b5bd3373c64ca89259245123419c93", ctx, $gte(
            $ret("e29e3f25be0a0b602ceb00d4f76d1ab4", ctx, $ref("date", _date, ctx, params)),
            () => $ret("1a353a9de7050446eb92effa4c6cd7f5", ctx, new Date('2025-01')))),
          $ret("bb0ed0f6b269d055b6f71aee8e51860a", ctx, true))), () => $ret("331ea1184da1f9359f278ea642bbd647", ctx, 3.4), () => $ret("bb0ed0f6b269d055b6f71aee8e51860a", ctx, $cond(
          $ret("bb0ed0f6b269d055b6f71aee8e51860a", ctx, $eq(
            $ret("2abca726a4b8c06c47e245241fa70065", ctx, $gte(
              $ret("820a58a3818329db7aea42074145b048", ctx, $ref("date", _date, ctx, params)),
              () => $ret("ed4c1c6de1ed6870f08d16050bfe86fa", ctx, new Date('2024-07')))),
            $ret("bb0ed0f6b269d055b6f71aee8e51860a", ctx, true))), () => $ret("3495d8c62ef9ef41fe9efd1096137bff", ctx, 3.6), () => $ret("17e29cf7980064f78689b6d6c6c5583c", ctx, 3.9)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_retraite_complémentaire(ctx, params) {
  return /** @type {number} */ (
    $ret("0765a79ea5247d9344e55cafb2439a8c", ctx, $mul(
      $ret("0765a79ea5247d9344e55cafb2439a8c", ctx, $mul(
        $ret("932c7a642366d817c18823c380cb8929", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC, ctx, params)),
        () => $ret("20c6fd84e263fbb120f9225decebb888", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_retraite_complémentaire_·_taux_de_répartition, ctx, params)))),
      () => $ret("0765a79ea5247d9344e55cafb2439a8c", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_retraite_complémentaire_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("af603ac4fb7f8abbd501631cc1cc29f4", ctx, $cond(
      $ret("af603ac4fb7f8abbd501631cc1cc29f4", ctx, $eq(
        $ret("a3dfda8073009471ea6c907b35f09b92", ctx, $gte(
          $ret("6a91542ca9fda2b63e8cd4d1a1f89f74", ctx, $ref("date", _date, ctx, params)),
          () => $ret("03678c46648dedb8c5b48e29dcf9be47", ctx, new Date('2026-01')))),
        $ret("af603ac4fb7f8abbd501631cc1cc29f4", ctx, true))), () => $ret("073a8de88383ff0c2f7c68c62a558f2a", ctx, 17.7), () => $ret("af603ac4fb7f8abbd501631cc1cc29f4", ctx, $cond(
        $ret("af603ac4fb7f8abbd501631cc1cc29f4", ctx, $eq(
          $ret("3a64f156025ddba81ad93a538a3c8a05", ctx, $gte(
            $ret("a9f16cf281d56dc8cf783efa954f2215", ctx, $ref("date", _date, ctx, params)),
            () => $ret("e8d0ca29bd8718c76aef3b85b33c260f", ctx, new Date('2025-01')))),
          $ret("af603ac4fb7f8abbd501631cc1cc29f4", ctx, true))), () => $ret("4481cc27d02ed516e401b89bc5be7157", ctx, 13.), () => $ret("af603ac4fb7f8abbd501631cc1cc29f4", ctx, $cond(
          $ret("af603ac4fb7f8abbd501631cc1cc29f4", ctx, $eq(
            $ret("3c3443858fbd55c77e679d9ea22e4212", ctx, $gte(
              $ret("a860ed2d7622c7424d174f1a8b082cd9", ctx, $ref("date", _date, ctx, params)),
              () => $ret("9dab4afdc2e0b5efdbcc7427c08c05c7", ctx, new Date('2024-07')))),
            $ret("af603ac4fb7f8abbd501631cc1cc29f4", ctx, true))), () => $ret("a2ef31bbc22816ee57e2aba2c398a5ae", ctx, 7.85), () => $ret("f2720b4810b4f577ae713053e0c638d1", ctx, 0.)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_retraite_de_base(ctx, params) {
  return /** @type {number} */ (
    $ret("8ef3c9af725955458fd5146fdfeb88ab", ctx, $mul(
      $ret("8ef3c9af725955458fd5146fdfeb88ab", ctx, $mul(
        $ret("cd08694b7ae1aa671d87e8e64bf9d4ba", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC, ctx, params)),
        () => $ret("67245b72c4db0f31e19b7778602e12d1", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_retraite_de_base_·_taux_de_répartition, ctx, params)))),
      () => $ret("8ef3c9af725955458fd5146fdfeb88ab", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_répartition_·_retraite_de_base_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("3e35a34dc03ac25e85c771216a3f81c9", ctx, $cond(
      $ret("3e35a34dc03ac25e85c771216a3f81c9", ctx, $eq(
        $ret("2ef73b2d4e2c1465203a16c3ad7afb8a", ctx, $gte(
          $ret("04d297624530f0cb63858781ee4da151", ctx, $ref("date", _date, ctx, params)),
          () => $ret("44da76de2c02eb248b43930454e16373", ctx, new Date('2026-01')))),
        $ret("3e35a34dc03ac25e85c771216a3f81c9", ctx, true))), () => $ret("6c117513272ea6c3b99e6457d6692dc6", ctx, 44.85), () => $ret("3e35a34dc03ac25e85c771216a3f81c9", ctx, $cond(
        $ret("3e35a34dc03ac25e85c771216a3f81c9", ctx, $eq(
          $ret("79c0d5fe7296b7e2d424dd1ce96464c2", ctx, $gte(
            $ret("0c764c0ea440034934511f0b5b13236c", ctx, $ref("date", _date, ctx, params)),
            () => $ret("b21f452bcfe9f102b39de26e3db205b5", ctx, new Date('2025-01')))),
          $ret("3e35a34dc03ac25e85c771216a3f81c9", ctx, true))), () => $ret("0c85edb73fe34a1ea831d23f176e52b3", ctx, 47.6), () => $ret("3e35a34dc03ac25e85c771216a3f81c9", ctx, $cond(
          $ret("3e35a34dc03ac25e85c771216a3f81c9", ctx, $eq(
            $ret("ac33d90d592857034e3773f25c9ea22f", ctx, $gte(
              $ret("bf646e89c068cbadb069560d00ef237b", ctx, $ref("date", _date, ctx, params)),
              () => $ret("56ce174eb70482f1aa6de8a0b32a9b75", ctx, new Date('2024-07')))),
            $ret("3e35a34dc03ac25e85c771216a3f81c9", ctx, true))), () => $ret("7e9b9f70c2cca36e5ee71477958b63a6", ctx, 50.75), () => $ret("16596d9d64cd690fa22dd5d6835d966a", ctx, 55.5)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_·_taux(ctx, params) {
  return /** @type {number} */ (
    $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, $cond(
      $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, $eq(
        $ret("60b6fb94094b930541d94a3a7cb41f36", ctx, $gte(
          $ret("8645dc5886685c3b8dd9fdf996b66290", ctx, $ref("date", _date, ctx, params)),
          () => $ret("033191de3d221fab373945fb013cf738", ctx, new Date('2026-01')))),
        $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, true))), () => $ret("cffb9093e5e63126105239a9249f2a95", ctx, 26.1), () => $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, $cond(
        $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, $eq(
          $ret("64067af6cdbaab9be1f1a27642d7c816", ctx, $gte(
            $ret("406287bbe2a30abc612e29f17ab206fe", ctx, $ref("date", _date, ctx, params)),
            () => $ret("8de9da12bd5f4c70ab6a12ec09ec1247", ctx, new Date('2025-01')))),
          $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, true))), () => $ret("4a1787f456ae81fd8ecbdab6f97fd7ac", ctx, 24.6), () => $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, $cond(
          $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, $eq(
            $ret("5c991ccbb1817f0a92d754df7fa2177d", ctx, $gte(
              $ret("67c4d0a06f6e4c9b51086853dcc5cb3f", ctx, $ref("date", _date, ctx, params)),
              () => $ret("a7d022690643483842dd9c16cf8eed5f", ctx, new Date('2024-07')))),
            $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, true))), () => $ret("ec039f649eea2c1116293f0da7b7fcbc", ctx, 23.1), () => $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, $cond(
            $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, $eq(
              $ret("3dac6d9d0599f00985204668a6b8c298", ctx, $gte(
                $ret("1babbabc5f792b8a09de6e3d4c69dd8f", ctx, $ref("date", _date, ctx, params)),
                () => $ret("8ff5c4277510bd6d69577d8a52a0dab3", ctx, new Date('2022-10')))),
              $ret("9ddbb181f876281f1cb7f312b47997d9", ctx, true))), () => $ret("93dc817a362f4e09eef372a1fce80f75", ctx, 21.1), () => $ret("9cafa9e39ea4ca732c2e0fa16f4d0e1f", ctx, 22.)))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav(ctx, params) {
  return /** @type {number} */ (
    $ret("66021b1fe56270ab7dd3544587ee69d2", ctx, $cond(
      $ret("66021b1fe56270ab7dd3544587ee69d2", ctx, $or(
        $ret("66021b1fe56270ab7dd3544587ee69d2", ctx, (isNotDefined($ret("97e446178eab4902a69dd72a99df000b", ctx, $ref("dirigeant . auto-entrepreneur . Cipav", _dirigeant_·_auto__t__entrepreneur_·_Cipav, ctx, params))))),
        () => $ret("66021b1fe56270ab7dd3544587ee69d2", ctx, $or(
          $ret("66021b1fe56270ab7dd3544587ee69d2", ctx, $eq(
            $ret("97e446178eab4902a69dd72a99df000b", ctx, $ref("dirigeant . auto-entrepreneur . Cipav", _dirigeant_·_auto__t__entrepreneur_·_Cipav, ctx, params)),
            $ret("66021b1fe56270ab7dd3544587ee69d2", ctx, false))),
          () => $ret("66021b1fe56270ab7dd3544587ee69d2", ctx, $eq(
            $ret("97e446178eab4902a69dd72a99df000b", ctx, $ref("dirigeant . auto-entrepreneur . Cipav", _dirigeant_·_auto__t__entrepreneur_·_Cipav, ctx, params)),
            $ret("66021b1fe56270ab7dd3544587ee69d2", ctx, NotApplicable))))))), () => $ret("66021b1fe56270ab7dd3544587ee69d2", ctx, NotApplicable), () => $ret("404af1b0c4f8eecd4552102a24beb8fe", ctx, $mul(
        $ret("404af1b0c4f8eecd4552102a24beb8fe", ctx, $mul(
          $ret("a42dbf005be00bca6240339e5d82b499", ctx, $cond(
            $ret("a42dbf005be00bca6240339e5d82b499", ctx, $neq(
              $ret("a42dbf005be00bca6240339e5d82b499", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux CIPAV", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_CIPAV, ctx, params)),
              $ret("a42dbf005be00bca6240339e5d82b499", ctx, NotApplicable))), () => $ret("a42dbf005be00bca6240339e5d82b499", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux CIPAV", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_CIPAV, ctx, params)), () => $ret("a42dbf005be00bca6240339e5d82b499", ctx, $cond(
              $ret("a42dbf005be00bca6240339e5d82b499", ctx, $neq(
                $ret("a42dbf005be00bca6240339e5d82b499", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux CIPAV", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_CIPAV, ctx, params)),
                $ret("a42dbf005be00bca6240339e5d82b499", ctx, NotApplicable))), () => $ret("a42dbf005be00bca6240339e5d82b499", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux CIPAV", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_CIPAV, ctx, params)), () => $ret("a42dbf005be00bca6240339e5d82b499", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_taux, ctx, params)))))),
          () => $ret("a9820c4da989098b2e65ae4dba1c8adf", ctx, $ref("entreprise . chiffre d'affaires . service BNC", _entreprise_·_chiffre_dʹaffaires_·_service_BNC, ctx, params)))),
        () => $ret("404af1b0c4f8eecd4552102a24beb8fe", ctx, 0.01)))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition(ctx, params) {
  return /** @type {unknown} */ (
    $ret("f824551c909fe01f6928a7669ade4ce5", ctx, $get("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_autres_contributions(ctx, params) {
  return /** @type {number} */ (
    $ret("6e0a72ae9d50e6c46f5b6b7954f9fb6f", ctx, $mul(
      $ret("6e0a72ae9d50e6c46f5b6b7954f9fb6f", ctx, $mul(
        $ret("23a008d487deedf8d17aee7ab2e1f874", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav, ctx, params)),
        () => $ret("b8058908aa60cd4220f55c56f6d23000", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_autres_contributions_·_taux_de_répartition, ctx, params)))),
      () => $ret("6e0a72ae9d50e6c46f5b6b7954f9fb6f", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_autres_contributions_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("25cedbde4def2369fcffbbda515cbe83", ctx, $cond(
      $ret("25cedbde4def2369fcffbbda515cbe83", ctx, $eq(
        $ret("b7c519ba10f4ac8dc2df21d3bb4bb340", ctx, $gte(
          $ret("e3c4cc0e76a1015fb7d14a996760ccb8", ctx, $ref("date", _date, ctx, params)),
          () => $ret("d64b04f00e54f6cfee3042d33b806455", ctx, new Date('2024-07')))),
        $ret("25cedbde4def2369fcffbbda515cbe83", ctx, true))), () => $ret("8d486f439ff7d79a6b87cd83897fe0db", ctx, 34.), () => $ret("4817766468378abc749b04c4176ee3ce", ctx, 36.3)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_invalidité__t__décès(ctx, params) {
  return /** @type {number} */ (
    $ret("27290433b2b2b896af785e71f8acf88c", ctx, $mul(
      $ret("27290433b2b2b896af785e71f8acf88c", ctx, $mul(
        $ret("10f89542883d484415f44a261aa2a7f3", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav, ctx, params)),
        () => $ret("0aff60c1c9f8e9568b787017dd35efc5", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_invalidité__t__décès_·_taux_de_répartition, ctx, params)))),
      () => $ret("27290433b2b2b896af785e71f8acf88c", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_invalidité__t__décès_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("7f112356f56b4716c419e01331e1c458", ctx, $cond(
      $ret("7f112356f56b4716c419e01331e1c458", ctx, $eq(
        $ret("a08055759ec6433c1af1efd6e58f2cbf", ctx, $gte(
          $ret("490164d95d2fc6e733e7a6962a49b3f9", ctx, $ref("date", _date, ctx, params)),
          () => $ret("cec66ef30af97d48a1b5ac370d595c5d", ctx, new Date('2024-07')))),
        $ret("7f112356f56b4716c419e01331e1c458", ctx, true))), () => $ret("8c8b37521b04b55f5eed6c748516406e", ctx, 1.4), () => $ret("4223e59759ce76ed89bcceda4f7cad18", ctx, 2.6)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_maladie__t__maternité(ctx, params) {
  return /** @type {number} */ (
    $ret("ed327cb1872b79fd078dea6a9c64658c", ctx, $mul(
      $ret("ed327cb1872b79fd078dea6a9c64658c", ctx, $mul(
        $ret("c112ea82436888145bce9ed3233db6f5", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav, ctx, params)),
        () => $ret("544f5978c54b04ed6baab43693874b22", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_maladie__t__maternité_·_taux_de_répartition, ctx, params)))),
      () => $ret("ed327cb1872b79fd078dea6a9c64658c", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_maladie__t__maternité_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("5faa1beaa81c8926bb5e26e0aa1c01b3", ctx, $cond(
      $ret("5faa1beaa81c8926bb5e26e0aa1c01b3", ctx, $eq(
        $ret("4f436a924eac1ee9d6d9e9b63088ec0f", ctx, $gte(
          $ret("5260481f5dbdf5ad777af5f71587b06b", ctx, $ref("date", _date, ctx, params)),
          () => $ret("8a78f92fc6ab19006de64cd01ce9c056", ctx, new Date('2024-07')))),
        $ret("5faa1beaa81c8926bb5e26e0aa1c01b3", ctx, true))), () => $ret("a665e77057a62a49b0f8792ebadcff1a", ctx, 10.2), () => $ret("37aedf628ecd7f47d8230d808dca7c9d", ctx, 9.05)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_retraite_complémentaire(ctx, params) {
  return /** @type {number} */ (
    $ret("b8520d7ebe9409d32326bcdd2dff83c1", ctx, $mul(
      $ret("b8520d7ebe9409d32326bcdd2dff83c1", ctx, $mul(
        $ret("f573701402f0c7444233793e90c0fd57", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav, ctx, params)),
        () => $ret("6c4bebc9dceeb134190c3aaab812cce9", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_retraite_complémentaire_·_taux_de_répartition, ctx, params)))),
      () => $ret("b8520d7ebe9409d32326bcdd2dff83c1", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_retraite_complémentaire_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("911cd1016e0ffcd18236a101638d2bda", ctx, $cond(
      $ret("911cd1016e0ffcd18236a101638d2bda", ctx, $eq(
        $ret("8fa60339edd43e65ceb90e7ec2e0bd1b", ctx, $gte(
          $ret("d9d485a06ac74cafab5c074e30dd41bd", ctx, $ref("date", _date, ctx, params)),
          () => $ret("9974a88240745c4483d61d6e0a8189c9", ctx, new Date('2024-07')))),
        $ret("911cd1016e0ffcd18236a101638d2bda", ctx, true))), () => $ret("9d251c610cbab38eae8acf224369caf2", ctx, 25.6), () => $ret("bb7562ba06f49fec8f2eef68bb4926cb", ctx, 20.75)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_retraite_de_base(ctx, params) {
  return /** @type {number} */ (
    $ret("f5a61eea4db4ff2b6a2bb0f9e9b0dbe7", ctx, $mul(
      $ret("f5a61eea4db4ff2b6a2bb0f9e9b0dbe7", ctx, $mul(
        $ret("031ff2c47511a6506b9f75c6007a03b8", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav, ctx, params)),
        () => $ret("3ff6343733c1bd1bdf6f30f3dd2de3de", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_retraite_de_base_·_taux_de_répartition, ctx, params)))),
      () => $ret("f5a61eea4db4ff2b6a2bb0f9e9b0dbe7", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_répartition_·_retraite_de_base_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("0b1ec86b024199bcef83e35545b2703f", ctx, $cond(
      $ret("0b1ec86b024199bcef83e35545b2703f", ctx, $eq(
        $ret("c831777663434f6318b1994152f598f6", ctx, $gte(
          $ret("a4b61550a8d2769eef857df1aacb1689", ctx, $ref("date", _date, ctx, params)),
          () => $ret("caf99e4b9d8fd983352cdeb1e8a70fb1", ctx, new Date('2024-07')))),
        $ret("0b1ec86b024199bcef83e35545b2703f", ctx, true))), () => $ret("0127a9b83db3b6200081402ce4161721", ctx, 28.8), () => $ret("73591e1f6d41c15dd1a87f84a75e50d7", ctx, 31.3)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_service_BNC_Cipav_·_taux(ctx, params) {
  return /** @type {number} */ (
    $ret("50becfd0f8dd8562adb00848069ca543", ctx, $cond(
      $ret("50becfd0f8dd8562adb00848069ca543", ctx, $eq(
        $ret("035226de2fc89609dcd81b35a59ed808", ctx, $gte(
          $ret("cb5a1534c45a3d11e122933c96b54d69", ctx, $ref("date", _date, ctx, params)),
          () => $ret("82fe372c1ab8b67e098c7630f6785216", ctx, new Date('2024-07')))),
        $ret("50becfd0f8dd8562adb00848069ca543", ctx, true))), () => $ret("e7dda00331275313906e6c2087200cf4", ctx, 23.2), () => $ret("c0b16c08a2cfbc9992bdee43db251876", ctx, 21.2)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement(ctx, params) {
  return /** @type {number} */ (
    $ret("a826ca763b10d7f610ad076431f84548", ctx, $mul(
      $ret("a826ca763b10d7f610ad076431f84548", ctx, $mul(
        $ret("0a3bfc3fc3125af1ef0d93c506cba518", ctx, $cond(
          $ret("0a3bfc3fc3125af1ef0d93c506cba518", ctx, $neq(
            $ret("0a3bfc3fc3125af1ef0d93c506cba518", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_vente_restauration_hébergement, ctx, params)),
            $ret("0a3bfc3fc3125af1ef0d93c506cba518", ctx, NotApplicable))), () => $ret("0a3bfc3fc3125af1ef0d93c506cba518", ctx, $ref("dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_DROM_·_taux_vente_restauration_hébergement, ctx, params)), () => $ret("0a3bfc3fc3125af1ef0d93c506cba518", ctx, $cond(
            $ret("0a3bfc3fc3125af1ef0d93c506cba518", ctx, $neq(
              $ret("0a3bfc3fc3125af1ef0d93c506cba518", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_vente_restauration_hébergement, ctx, params)),
              $ret("0a3bfc3fc3125af1ef0d93c506cba518", ctx, NotApplicable))), () => $ret("0a3bfc3fc3125af1ef0d93c506cba518", ctx, $ref("dirigeant . auto-entrepreneur . Acre . taux vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_Acre_·_taux_vente_restauration_hébergement, ctx, params)), () => $ret("0a3bfc3fc3125af1ef0d93c506cba518", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_taux, ctx, params)))))),
        () => $ret("51bda1ea7cbc98ca46d6a7307745d165", ctx, $ref("entreprise . chiffre d'affaires . vente restauration hébergement", _entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergement, ctx, params)))),
      () => $ret("a826ca763b10d7f610ad076431f84548", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition(ctx, params) {
  return /** @type {unknown} */ (
    $ret("2e7e2de9c2e3721fd2703d3f44db2444", ctx, $get("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_autres_contributions(ctx, params) {
  return /** @type {number} */ (
    $ret("f29744c24d690da2ce325905a56feed4", ctx, $mul(
      $ret("f29744c24d690da2ce325905a56feed4", ctx, $mul(
        $ret("ad66b3315157aa2c7f52eed2e355a04b", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement, ctx, params)),
        () => $ret("e95ec45be21ee380a575c7a6c47083d1", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_autres_contributions_·_taux_de_répartition, ctx, params)))),
      () => $ret("f29744c24d690da2ce325905a56feed4", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_autres_contributions_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("049d1d8db73a9ef9b96e36a026283af1", ctx, 29.7)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_invalidité__t__décès(ctx, params) {
  return /** @type {number} */ (
    $ret("9f0c9d96931f4122963c45de5f3b01dd", ctx, $mul(
      $ret("9f0c9d96931f4122963c45de5f3b01dd", ctx, $mul(
        $ret("6c290fd74532f49ead8aeedf5f5f9b8d", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement, ctx, params)),
        () => $ret("9f81117295ae37ba9c8b6645120a43bb", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_invalidité__t__décès_·_taux_de_répartition, ctx, params)))),
      () => $ret("9f0c9d96931f4122963c45de5f3b01dd", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_invalidité__t__décès_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("e2794a973a070896fab168b00431c8c9", ctx, 3.1)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_maladie__t__maternité(ctx, params) {
  return /** @type {number} */ (
    $ret("e1d17e2d7c00012b50d7525430d47fca", ctx, $mul(
      $ret("e1d17e2d7c00012b50d7525430d47fca", ctx, $mul(
        $ret("092948fc3e639df0aeef7a4a0ee11b5a", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement, ctx, params)),
        () => $ret("31ea4065a00f62fc8c6d5e4285880f19", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_maladie__t__maternité_·_taux_de_répartition, ctx, params)))),
      () => $ret("e1d17e2d7c00012b50d7525430d47fca", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_maladie__t__maternité_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("0300a5646ef7da9e68ead6309ba94091", ctx, 8.9)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_retraite_complémentaire(ctx, params) {
  return /** @type {number} */ (
    $ret("52a98d35af9bb9949837bb72559d7f85", ctx, $mul(
      $ret("52a98d35af9bb9949837bb72559d7f85", ctx, $mul(
        $ret("af77f6451e84420b05d208d81effbd3a", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement, ctx, params)),
        () => $ret("75c2fe56fce480242499cf9576ae4aca", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_retraite_complémentaire_·_taux_de_répartition, ctx, params)))),
      () => $ret("52a98d35af9bb9949837bb72559d7f85", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_retraite_complémentaire_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("3edcbe313fe62ce3fff9355d5d2be50c", ctx, 16.5)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_retraite_de_base(ctx, params) {
  return /** @type {number} */ (
    $ret("c074f32a14659e81bf63effaf845c931", ctx, $mul(
      $ret("c074f32a14659e81bf63effaf845c931", ctx, $mul(
        $ret("418f785016d8d0a85fcbf8daeb531b1a", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement, ctx, params)),
        () => $ret("c36ef04850cb23e0430f7e9e7b873390", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_retraite_de_base_·_taux_de_répartition, ctx, params)))),
      () => $ret("c074f32a14659e81bf63effaf845c931", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_répartition_·_retraite_de_base_·_taux_de_répartition(ctx, params) {
  return /** @type {number} */ (
    $ret("27205043a8643e0b9e8b1b822a4c40af", ctx, 41.8)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations_·_vente_restauration_hébergement_·_taux(ctx, params) {
  return /** @type {number} */ (
    $ret("4b5e6e0dd4ec2f89b56b0684072b20c1", ctx, $cond(
      $ret("4b5e6e0dd4ec2f89b56b0684072b20c1", ctx, $eq(
        $ret("642fa0d1d45e11168df015fcfeb1c961", ctx, $gte(
          $ret("28e70b187b82297d57d99b079887bbee", ctx, $ref("date", _date, ctx, params)),
          () => $ret("b4d7410d58f1a2884de9d92b06892fbd", ctx, new Date('2022-10')))),
        $ret("4b5e6e0dd4ec2f89b56b0684072b20c1", ctx, true))), () => $ret("9bee649ae4269268120b2ee766a6c266", ctx, 12.3), () => $ret("c9c56d1303e0032573da222fcc4fb2b7", ctx, 12.8)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_impôt(ctx, params) {
  return /** @type {boolean} */ (
    $ret("02dee3029f77c958b60a4ec35fb73561", ctx, true)
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_impôt_·_revenu_imposable(ctx, params) {
  return /** @type {number} */ (
    $ret("b289bef4882572fe6cc6bd1f4887200b", ctx, $ref("entreprise . imposition . régime . micro-entreprise . revenu abattu", _entreprise_·_imposition_·_régime_·_micro__t__entreprise_·_revenu_abattu, ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_impôt_·_versement_libératoire(ctx, params) {
  return /** @type {boolean} */ (
    $ret("5a823012b77e6f3e2cdd712ce88e56b3", ctx, $cond(
      $ret("5a823012b77e6f3e2cdd712ce88e56b3", ctx, (isNotDefined($ret("20af94d9698bb4aac77610e39642b7a4", ctx, $get("dirigeant . auto-entrepreneur . impôt . versement libératoire", ctx, params))))), () => $ret("2ddb5ec6ec00b7e509b7b22a039418b3", ctx, false), () => $ret("20af94d9698bb4aac77610e39642b7a4", ctx, $get("dirigeant . auto-entrepreneur . impôt . versement libératoire", ctx, params))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_impôt_·_versement_libératoire_·_montant(ctx, params) {
  return /** @type {number} */ (
    $ret("1bc80d5a3268176e428be1056a62055b", ctx, $add(
      $ret("c75d95d92b6ee5885bf693b7a3dfe1cf", ctx, $mul(
        $ret("c75d95d92b6ee5885bf693b7a3dfe1cf", ctx, $mul(
          $ret("c5ccb8bb46930a73f3a7f9f82efc7d48", ctx, 1.7),
          () => $ret("4be0ddb5e11530dfb93d7d66abf40e28", ctx, $ref("entreprise . chiffre d'affaires . service BIC", _entreprise_·_chiffre_dʹaffaires_·_service_BIC, ctx, params)))),
        () => $ret("c75d95d92b6ee5885bf693b7a3dfe1cf", ctx, 0.01))),
      $ret("1bc80d5a3268176e428be1056a62055b", ctx, $add(
        $ret("c05db26ea9f27182cc80b2c9daace1c1", ctx, $mul(
          $ret("c05db26ea9f27182cc80b2c9daace1c1", ctx, $mul(
            $ret("0c53728e56598a2d62872167b772dd9c", ctx, 2.2),
            () => $ret("e93f65f1cdcece95a02d93e9392b30cb", ctx, $ref("entreprise . chiffre d'affaires . service BNC", _entreprise_·_chiffre_dʹaffaires_·_service_BNC, ctx, params)))),
          () => $ret("c05db26ea9f27182cc80b2c9daace1c1", ctx, 0.01))),
        $ret("ee417bf81e50e9bdffc20cd346ec10fa", ctx, $mul(
          $ret("ee417bf81e50e9bdffc20cd346ec10fa", ctx, $mul(
            $ret("a0cbced956fa0ebd448c82a3967dc3a5", ctx, 1.),
            () => $ret("733819873067c09d069cbe5bf3eddb61", ctx, $ref("entreprise . chiffre d'affaires . vente restauration hébergement", _entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergement, ctx, params)))),
          () => $ret("ee417bf81e50e9bdffc20cd346ec10fa", ctx, 0.01)))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_impôt_·_versement_libératoire_·_seuil_dépassé(ctx, params) {
  return /** @type {boolean} */ (
    $ret("830a82360d5bfdedda3b7f9ff118bea6", ctx, $gt(
      $ret("0f5a85e220c2783e5a993b861ec8ea8f", ctx, $ref("impôt . foyer fiscal . revenu fiscal de référence", _impôt_·_foyer_fiscal_·_revenu_fiscal_de_référence, ctx, params)),
      () => $ret("57ac5c32997ad57ed4f3ee980393ac52", ctx, 27519.)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_revenu_net(ctx, params) {
  return /** @type {number} */ (
    $ret("003f5f6de2625c212e70ade4fed99e39", ctx, $round("nearest", $ret("003f5f6de2625c212e70ade4fed99e39", ctx, $sub(
      $ret("4a3ef3357bbe52a7b5c8538d7a0ff273", ctx, $ref("entreprise . chiffre d'affaires", _entreprise_·_chiffre_dʹaffaires, ctx, params)),
      $ret("71515d8b1ee68cf7417277de7fcb0fba", ctx, $ref("dirigeant . auto-entrepreneur . cotisations et contributions", _dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions, ctx, params)))), () => $ret("863c993d8fe9397592d7757008346feb", ctx, $cond(
      $ret("863c993d8fe9397592d7757008346feb", ctx, true), () => $ret("863c993d8fe9397592d7757008346feb", ctx, 1.), () => $ret("863c993d8fe9397592d7757008346feb", ctx, NotApplicable)))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _dirigeant_·_auto__t__entrepreneur_·_revenu_net_·_après_impôt(ctx, params) {
  return /** @type {number} */ (
    $ret("4389d0192a0bc18ebe15ec33a693dab5", ctx, $round("nearest", $ret("4389d0192a0bc18ebe15ec33a693dab5", ctx, $sub(
      $ret("c21c3f1c7f0f232ddaa9db5f3e28cdda", ctx, $ref("dirigeant . auto-entrepreneur . revenu net", _dirigeant_·_auto__t__entrepreneur_·_revenu_net, ctx, params)),
      $ret("23d5009584d67fe9fcf0809d7086abbb", ctx, $ref("rémunération . impôt", _rémunération_·_impôt, ctx, params)))), () => $ret("32825e2ae67566f2ee2ac390ebf4da15", ctx, $cond(
      $ret("32825e2ae67566f2ee2ac390ebf4da15", ctx, true), () => $ret("32825e2ae67566f2ee2ac390ebf4da15", ctx, 1.), () => $ret("32825e2ae67566f2ee2ac390ebf4da15", ctx, NotApplicable)))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_auto__t__entrepreneur_·_éligible_à_lʹACRE(ctx, params) {
  return /** @type {boolean} */ (
    $ret("549058e2fca276705a10745c807cd169", ctx, $cond(
      $ret("549058e2fca276705a10745c807cd169", ctx, $or(
        $ret("549058e2fca276705a10745c807cd169", ctx, (isNotDefined($ret("0c916ccbc451b7d0ca21be9d9f1a7e9e", ctx, $lt(
          $ret("dc1d3e1d384a68fcc6de62de9c6c488f", ctx, $ref("entreprise . durée d'activité . en début d'année", _entreprise_·_durée_dʹactivité_·_en_début_dʹannée, ctx, params)),
          () => $ret("2d8278309a91c60463314cd8ddf8b3d8", ctx, 1.)))))),
        () => $ret("549058e2fca276705a10745c807cd169", ctx, $or(
          $ret("549058e2fca276705a10745c807cd169", ctx, $eq(
            $ret("0c916ccbc451b7d0ca21be9d9f1a7e9e", ctx, $lt(
              $ret("dc1d3e1d384a68fcc6de62de9c6c488f", ctx, $ref("entreprise . durée d'activité . en début d'année", _entreprise_·_durée_dʹactivité_·_en_début_dʹannée, ctx, params)),
              () => $ret("2d8278309a91c60463314cd8ddf8b3d8", ctx, 1.))),
            $ret("549058e2fca276705a10745c807cd169", ctx, false))),
          () => $ret("549058e2fca276705a10745c807cd169", ctx, $eq(
            $ret("0c916ccbc451b7d0ca21be9d9f1a7e9e", ctx, $lt(
              $ret("dc1d3e1d384a68fcc6de62de9c6c488f", ctx, $ref("entreprise . durée d'activité . en début d'année", _entreprise_·_durée_dʹactivité_·_en_début_dʹannée, ctx, params)),
              () => $ret("2d8278309a91c60463314cd8ddf8b3d8", ctx, 1.))),
            $ret("549058e2fca276705a10745c807cd169", ctx, NotApplicable))))))), () => $ret("549058e2fca276705a10745c807cd169", ctx, NotApplicable), () => $ret("5a0b68fbfa5bcf27d4ac29fcf7129c16", ctx, $cond(
        $ret("5a0b68fbfa5bcf27d4ac29fcf7129c16", ctx, (isNotDefined($ret("9033d6386f4d8563c315f1239bcaa1aa", ctx, $get("dirigeant . auto-entrepreneur . éligible à l'ACRE", ctx, params))))), () => $ret("47ad401b3e1b64dfe519f86d11fdbe4c", ctx, false), () => $ret("9033d6386f4d8563c315f1239bcaa1aa", ctx, $get("dirigeant . auto-entrepreneur . éligible à l'ACRE", ctx, params))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _dirigeant_·_exonérations(ctx, params) {
  return /** @type {unknown} */ (
    $ret("80beb8dc56d753d919c1ca563ef53538", ctx, $get("dirigeant . exonérations", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _dirigeant_·_exonérations_·_ACRE(ctx, params) {
  return /** @type {boolean} */ (
    $ret("2809f2998bd513e84767ef3d3a28e5a1", ctx, $get("dirigeant . exonérations . ACRE", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => string} */
function _dirigeant_·_régime_social(ctx, params) {
  return /** @type {string} */ (
    $ret("f7482571c80c8aaacb7b96d2d0d0f6ab", ctx, "auto-entrepreneur")
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _entreprise(ctx, params) {
  return /** @type {unknown} */ (
    $ret("9617d923574c238fd263ce7ea4934ba2", ctx, $get("entreprise", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _entreprise_·_activité(ctx, params) {
  return /** @type {unknown} */ (
    $ret("78c79ba6b222bdb06443a4eb32001ead", ctx, $get("entreprise . activité", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => string} */
function _entreprise_·_activité_·_nature(ctx, params) {
  return /** @type {string} */ (
    $ret("3446d5beff60708a776f948ae1390528", ctx, $get("entreprise . activité . nature", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _entreprise_·_activité_·_nature_·_libérale(ctx, params) {
  return /** @type {unknown} */ (
    $ret("1291111c7d64bb789df5fdcec7fe6528", ctx, $get("entreprise . activité . nature . libérale", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _entreprise_·_activité_·_nature_·_libérale_·_réglementée(ctx, params) {
  return /** @type {boolean} */ (
    $ret("b5f6c5d407a5acb49eab7d78fd17e68a", ctx, $get("entreprise . activité . nature . libérale . réglementée", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _entreprise_·_activités(ctx, params) {
  return /** @type {unknown} */ (
    $ret("89f8125a9b304f0643e521221b605706", ctx, $get("entreprise . activités", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _entreprise_·_activités_·_revenus_mixtes(ctx, params) {
  return /** @type {unknown} */ (
    $ret("804103a989bf9b8f1a3a02f2b82f4034", ctx, $get("entreprise . activités . revenus mixtes", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _entreprise_·_chiffre_dʹaffaires(ctx, params) {
  return /** @type {number} */ (
    $ret("37704be9bc76273f5800a7a03c162e47", ctx, $add(
      $ret("690471b0fff51bcd7c64120f8beca1ad", ctx, $ref("entreprise . chiffre d'affaires . service BIC", _entreprise_·_chiffre_dʹaffaires_·_service_BIC, ctx, params)),
      $ret("37704be9bc76273f5800a7a03c162e47", ctx, $add(
        $ret("b62bb4d8463269978d6365afda648c34", ctx, $ref("entreprise . chiffre d'affaires . service BNC", _entreprise_·_chiffre_dʹaffaires_·_service_BNC, ctx, params)),
        $ret("37704be9bc76273f5800a7a03c162e47", ctx, $add(
          $ret("984cc160dc62356a783a649f476995a2", ctx, $ref("entreprise . chiffre d'affaires . vente restauration hébergement", _entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergement, ctx, params)),
          $ret("6c885db893da03230d2eaee3a2306988", ctx, $ref("entreprise . chiffre d'affaires . BIC", _entreprise_·_chiffre_dʹaffaires_·_BIC, ctx, params))))))))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _entreprise_·_chiffre_dʹaffaires_·_BIC(ctx, params) {
  return /** @type {number} */ (
    $ret("0f0397c3a9bbb01486c98388b8345767", ctx, $get("entreprise . chiffre d'affaires . BIC", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _entreprise_·_chiffre_dʹaffaires_·_service_BIC(ctx, params) {
  return /** @type {number} */ (
    $ret("1b044f33139179a6a347412f48de3ff0", ctx, $get("entreprise . chiffre d'affaires . service BIC", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _entreprise_·_chiffre_dʹaffaires_·_service_BNC(ctx, params) {
  return /** @type {number} */ (
    $ret("3dc251d80d8c15bd51953f2ec0dad6e5", ctx, $get("entreprise . chiffre d'affaires . service BNC", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergement(ctx, params) {
  return /** @type {number} */ (
    $ret("95e804d53b16b4deb6bdeba6de55c204", ctx, $get("entreprise . chiffre d'affaires . vente restauration hébergement", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => Date} */
function _entreprise_·_date_de_création(ctx, params) {
  return /** @type {Date} */ (
    $ret("d1b1bd56d37cb09d1ee415fc44fd6c98", ctx, $get("entreprise . date de création", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _entreprise_·_durée_dʹactivité(ctx, params) {
  return /** @type {number} */ (
    $ret("cdc521d0d14098a63a29c6e2d16020bf", ctx, $get("entreprise . durée d'activité", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _entreprise_·_durée_dʹactivité_·_années_civiles(ctx, params) {
  return /** @type {number} */ (
    $ret("4b61b7a55b993747a827ca68f7790e99", ctx, $get("entreprise . durée d'activité . années civiles", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _entreprise_·_durée_dʹactivité_·_en_début_dʹannée(ctx, params) {
  return /** @type {number} */ (
    $ret("eb5824a5b46da62df21d9bad2f9af73b", ctx, $get("entreprise . durée d'activité . en début d'année", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _entreprise_·_durée_dʹactivité_·_trimestres_civils(ctx, params) {
  return /** @type {number} */ (
    $ret("561d9258b4fa33d3d7dac4344b0f1e37", ctx, $get("entreprise . durée d'activité . trimestres civils", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _entreprise_·_imposition(ctx, params) {
  return /** @type {unknown} */ (
    $ret("a7f3a4177c681c87fc22f4ae2c9febef", ctx, $get("entreprise . imposition", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _entreprise_·_imposition_·_régime(ctx, params) {
  return /** @type {unknown} */ (
    $ret("1f817129de334a260bbee8054dcb3ca8", ctx, $get("entreprise . imposition . régime", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _entreprise_·_imposition_·_régime_·_micro__t__entreprise(ctx, params) {
  return /** @type {unknown} */ (
    $ret("a075c9f4bc39e9f8b19b7c3268a81664", ctx, $get("entreprise . imposition . régime . micro-entreprise", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _entreprise_·_imposition_·_régime_·_micro__t__entreprise_·_revenu_abattu(ctx, params) {
  return /** @type {number} */ (
    $ret("18ccbf0045a874e90fd4414758d0787b", ctx, $mul(
      $ret("18ccbf0045a874e90fd4414758d0787b", ctx, $mul(
        $ret("40af35c8eb015501f43f5132bb537cce", ctx, 60.),
        () => $ret("a18d641e1e08dd9d51588f624d84d934", ctx, $ref("entreprise . chiffre d'affaires", _entreprise_·_chiffre_dʹaffaires, ctx, params)))),
      () => $ret("18ccbf0045a874e90fd4414758d0787b", ctx, 0.01)))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _impôt(ctx, params) {
  return /** @type {unknown} */ (
    $ret("c5166519150a9ca7258b3c807d58b0b7", ctx, $get("impôt", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _impôt_·_foyer_fiscal(ctx, params) {
  return /** @type {unknown} */ (
    $ret("3d9fadfc43e2c4a89a3c656a8d0d85c8", ctx, $get("impôt . foyer fiscal", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _impôt_·_foyer_fiscal_·_revenu_fiscal_de_référence(ctx, params) {
  return /** @type {number} */ (
    $ret("360a31e54d74c6c9b35f276a68ec4aaf", ctx, $get("impôt . foyer fiscal . revenu fiscal de référence", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _revenu_imposable(ctx, params) {
  return /** @type {unknown} */ (
    $ret("4ae223420f4ff64b479bd1a30bba4db0", ctx, $get("revenu imposable", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _rémunération(ctx, params) {
  return /** @type {unknown} */ (
    $ret("3254ab7c76d4052ebb47e4a7f01a741c", ctx, $get("rémunération", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => number} */
function _rémunération_·_impôt(ctx, params) {
  return /** @type {number} */ (
    $ret("e32b4638fb0969f9fc6c3c18746ca6a5", ctx, $get("rémunération . impôt", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _établissement(ctx, params) {
  return /** @type {unknown} */ (
    $ret("8500be714668b83e710b2b644d304737", ctx, $get("établissement", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => unknown} */
function _établissement_·_commune(ctx, params) {
  return /** @type {unknown} */ (
    $ret("6dea2708055e8514ff561dd570921bcb", ctx, $get("établissement . commune", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => string} */
function _établissement_·_commune_·_département(ctx, params) {
  return /** @type {string} */ (
    $ret("47958a12a7889a48352fff7c1a55222f", ctx, $get("établissement . commune . département", ctx, params))
  )
}

/** @type {(ctx: Context, params: RuleName[]) => boolean} */
function _établissement_·_commune_·_département_·_outre__t__mer(ctx, params) {
  return /** @type {boolean} */ (
    $ret("b8b9a06b11c3bbb8216129a5d6293cd9", ctx, $get("établissement . commune . département . outre-mer", ctx, params))
  )
}

/** Exported outputs/inputs */

const rules = {
  'entreprise . date de création': {
    /**
     * Parameters of "entreprise . date de création"
     * @typedef {{
     *  'entreprise . date de création'?: Date
     * }} entreprise_·_date_de_créationParams
     */
    /**
     * Evaluate "entreprise . date de création" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: entreprise_·_date_de_créationParams, options?: Options) => {value: Date, needed: Array<keyof entreprise_·_date_de_créationParams>, missing: Array<keyof entreprise_·_date_de_créationParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_entreprise_·_date_de_création, params, options),
    /** @type {"date"} */
    type: "date",
    /**
     * Parameter list for "entreprise . date de création"
     * @type {Array<keyof entreprise_·_date_de_créationParams>}
     */
    params: ['entreprise . date de création'],
  },
  'entreprise . chiffre d\'affaires . vente restauration hébergement': {
    /**
     * Parameters of "entreprise . chiffre d'affaires . vente restauration hébergement"
     * @typedef {{
     *  'entreprise . chiffre d\'affaires . vente restauration hébergement'?: number
     * }} entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergementParams
     */
    /**
     * Evaluate "entreprise . chiffre d'affaires . vente restauration hébergement" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergementParams, options?: Options) => {value: number, needed: Array<keyof entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergementParams>, missing: Array<keyof entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergementParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergement, params, options),
    /** @type {"number"} */
    type: "number",
    /** @type {"€/an"} */
    unit: "€/an",
    /**
     * Parameter list for "entreprise . chiffre d'affaires . vente restauration hébergement"
     * @type {Array<keyof entreprise_·_chiffre_dʹaffaires_·_vente_restauration_hébergementParams>}
     */
    params: ['entreprise . chiffre d\'affaires . vente restauration hébergement'],
  },
  'entreprise . chiffre d\'affaires . service BNC': {
    /**
     * Parameters of "entreprise . chiffre d'affaires . service BNC"
     * @typedef {{
     *  'entreprise . chiffre d\'affaires . service BNC'?: number
     * }} entreprise_·_chiffre_dʹaffaires_·_service_BNCParams
     */
    /**
     * Evaluate "entreprise . chiffre d'affaires . service BNC" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: entreprise_·_chiffre_dʹaffaires_·_service_BNCParams, options?: Options) => {value: number, needed: Array<keyof entreprise_·_chiffre_dʹaffaires_·_service_BNCParams>, missing: Array<keyof entreprise_·_chiffre_dʹaffaires_·_service_BNCParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_entreprise_·_chiffre_dʹaffaires_·_service_BNC, params, options),
    /** @type {"number"} */
    type: "number",
    /** @type {"€/an"} */
    unit: "€/an",
    /**
     * Parameter list for "entreprise . chiffre d'affaires . service BNC"
     * @type {Array<keyof entreprise_·_chiffre_dʹaffaires_·_service_BNCParams>}
     */
    params: ['entreprise . chiffre d\'affaires . service BNC'],
  },
  'entreprise . chiffre d\'affaires . service BIC': {
    /**
     * Parameters of "entreprise . chiffre d'affaires . service BIC"
     * @typedef {{
     *  'entreprise . chiffre d\'affaires . service BIC'?: number
     * }} entreprise_·_chiffre_dʹaffaires_·_service_BICParams
     */
    /**
     * Evaluate "entreprise . chiffre d'affaires . service BIC" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: entreprise_·_chiffre_dʹaffaires_·_service_BICParams, options?: Options) => {value: number, needed: Array<keyof entreprise_·_chiffre_dʹaffaires_·_service_BICParams>, missing: Array<keyof entreprise_·_chiffre_dʹaffaires_·_service_BICParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_entreprise_·_chiffre_dʹaffaires_·_service_BIC, params, options),
    /** @type {"number"} */
    type: "number",
    /** @type {"€/an"} */
    unit: "€/an",
    /**
     * Parameter list for "entreprise . chiffre d'affaires . service BIC"
     * @type {Array<keyof entreprise_·_chiffre_dʹaffaires_·_service_BICParams>}
     */
    params: ['entreprise . chiffre d\'affaires . service BIC'],
  },
  'entreprise . chiffre d\'affaires . BIC': {
    /**
     * Parameters of "entreprise . chiffre d'affaires . BIC"
     * @typedef {{
     *  'entreprise . chiffre d\'affaires . BIC'?: number
     * }} entreprise_·_chiffre_dʹaffaires_·_BICParams
     */
    /**
     * Evaluate "entreprise . chiffre d'affaires . BIC" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: entreprise_·_chiffre_dʹaffaires_·_BICParams, options?: Options) => {value: number, needed: Array<keyof entreprise_·_chiffre_dʹaffaires_·_BICParams>, missing: Array<keyof entreprise_·_chiffre_dʹaffaires_·_BICParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_entreprise_·_chiffre_dʹaffaires_·_BIC, params, options),
    /** @type {"number"} */
    type: "number",
    /** @type {"€/an"} */
    unit: "€/an",
    /**
     * Parameter list for "entreprise . chiffre d'affaires . BIC"
     * @type {Array<keyof entreprise_·_chiffre_dʹaffaires_·_BICParams>}
     */
    params: ['entreprise . chiffre d\'affaires . BIC'],
  },
  'entreprise . activité . nature . libérale . réglementée': {
    /**
     * Parameters of "entreprise . activité . nature . libérale . réglementée"
     * @typedef {{
     *  'entreprise . activité . nature . libérale . réglementée'?: boolean
     * }} entreprise_·_activité_·_nature_·_libérale_·_réglementéeParams
     */
    /**
     * Evaluate "entreprise . activité . nature . libérale . réglementée" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: entreprise_·_activité_·_nature_·_libérale_·_réglementéeParams, options?: Options) => {value: boolean, needed: Array<keyof entreprise_·_activité_·_nature_·_libérale_·_réglementéeParams>, missing: Array<keyof entreprise_·_activité_·_nature_·_libérale_·_réglementéeParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_entreprise_·_activité_·_nature_·_libérale_·_réglementée, params, options),
    /** @type {"boolean"} */
    type: "boolean",
    /**
     * Parameter list for "entreprise . activité . nature . libérale . réglementée"
     * @type {Array<keyof entreprise_·_activité_·_nature_·_libérale_·_réglementéeParams>}
     */
    params: ['entreprise . activité . nature . libérale . réglementée'],
  },
  'entreprise . activité . nature': {
    /**
     * Parameters of "entreprise . activité . nature"
     * @typedef {{
     *  'entreprise . activité . nature'?: string
     * }} entreprise_·_activité_·_natureParams
     */
    /**
     * Evaluate "entreprise . activité . nature" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: entreprise_·_activité_·_natureParams, options?: Options) => {value: string, needed: Array<keyof entreprise_·_activité_·_natureParams>, missing: Array<keyof entreprise_·_activité_·_natureParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_entreprise_·_activité_·_nature, params, options),
    /** @type {"text"} */
    type: "text",
    /**
     * Parameter list for "entreprise . activité . nature"
     * @type {Array<keyof entreprise_·_activité_·_natureParams>}
     */
    params: ['entreprise . activité . nature'],
  },
  /**
   * Depuis le 1er janvier 2018, les auto-entreprises d’activité libérale non
   * réglementée sont affiliées à la Sécurité sociale pour les indépendants (SSI).
   *
   * Les auto-entreprises d’activité libérale non réglementée créées avant le 1er
   * janvier 2018, qui étaient adhérentes à la Cipav, demeurent à la Cipav.
   *
   * Les auto-entrepreneurs concernés disposent toutefois d’un droit d’option
   * durant cinq ans afin de rejoindre la Sécurité sociale pour les indépendants
   * (SSI).
   */
  'dirigeant . auto-entrepreneur . Cipav . adhérent': {
    /**
     * Parameters of "dirigeant . auto-entrepreneur . Cipav . adhérent"
     * @typedef {{
     *  'dirigeant . auto-entrepreneur . Cipav . adhérent'?: boolean
     * }} dirigeant_·_auto__t__entrepreneur_·_Cipav_·_adhérentParams
     */
    /**
     * Evaluate "dirigeant . auto-entrepreneur . Cipav . adhérent" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: dirigeant_·_auto__t__entrepreneur_·_Cipav_·_adhérentParams, options?: Options) => {value: boolean, needed: Array<keyof dirigeant_·_auto__t__entrepreneur_·_Cipav_·_adhérentParams>, missing: Array<keyof dirigeant_·_auto__t__entrepreneur_·_Cipav_·_adhérentParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_dirigeant_·_auto__t__entrepreneur_·_Cipav_·_adhérent, params, options),
    /** @type {"boolean"} */
    type: "boolean",
    /**
     * Parameter list for "dirigeant . auto-entrepreneur . Cipav . adhérent"
     * @type {Array<keyof dirigeant_·_auto__t__entrepreneur_·_Cipav_·_adhérentParams>}
     */
    params: ['dirigeant . auto-entrepreneur . Cipav . adhérent'],
    /** @type {string} */
    description: 'Depuis le 1er janvier 2018, les auto-entreprises d’activité libérale non\nréglementée sont affiliées à la Sécurité sociale pour les indépendants (SSI).\n\nLes auto-entreprises d’activité libérale non réglementée créées avant le 1er\njanvier 2018, qui étaient adhérentes à la Cipav, demeurent à la Cipav.\n\nLes auto-entrepreneurs concernés disposent toutefois d’un droit d’option\ndurant cinq ans afin de rejoindre la Sécurité sociale pour les indépendants\n(SSI).\n',
    /** Custom meta of rule "dirigeant . auto-entrepreneur . Cipav . adhérent" */
    meta: {"question":"Êtes-vous adhérent à la Cipav ?","références":{"Qui est assuré à la Cipav ?":"https://www.lacipav.fr/qui-est-assure-cipav"}} /** @type {const} */,
  },
  'date': {
    /**
     * Parameters of "date"
     * @typedef {{
     *  'date'?: Date
     * }} dateParams
     */
    /**
     * Evaluate "date" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: dateParams, options?: Options) => {value: Date, needed: Array<keyof dateParams>, missing: Array<keyof dateParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_date, params, options),
    /** @type {"date"} */
    type: "date",
    /**
     * Parameter list for "date"
     * @type {Array<keyof dateParams>}
     */
    params: ['date'],
  },
  /**
   * Il s’agit du revenu après déductions des cotisations, avant le paiement de l’impôt sur le revenu.
   */
  'dirigeant . auto-entrepreneur . revenu net': {
    /**
     * Parameters of "dirigeant . auto-entrepreneur . revenu net"
     * @typedef {{
     *  'entreprise . date de création'?: Date
     *  'entreprise . chiffre d\'affaires . vente restauration hébergement'?: number
     *  'entreprise . chiffre d\'affaires . service BNC'?: number
     *  'entreprise . chiffre d\'affaires . service BIC'?: number
     *  'entreprise . chiffre d\'affaires . BIC'?: number
     *  'entreprise . activité . nature . libérale . réglementée'?: boolean
     *  'entreprise . activité . nature'?: string
     *  'dirigeant . auto-entrepreneur . Cipav . adhérent'?: boolean
     *  'date'?: Date
     * }} dirigeant_·_auto__t__entrepreneur_·_revenu_netParams
     */
    /**
     * Evaluate "dirigeant . auto-entrepreneur . revenu net" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: dirigeant_·_auto__t__entrepreneur_·_revenu_netParams, options?: Options) => {value: number, needed: Array<keyof dirigeant_·_auto__t__entrepreneur_·_revenu_netParams>, missing: Array<keyof dirigeant_·_auto__t__entrepreneur_·_revenu_netParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_dirigeant_·_auto__t__entrepreneur_·_revenu_net, params, options),
    /** @type {"number"} */
    type: "number",
    /** @type {"€/an"} */
    unit: "€/an",
    /**
     * Parameter list for "dirigeant . auto-entrepreneur . revenu net"
     * @type {Array<keyof dirigeant_·_auto__t__entrepreneur_·_revenu_netParams>}
     */
    params: ['entreprise . date de création',
             'entreprise . chiffre d\'affaires . vente restauration hébergement',
             'entreprise . chiffre d\'affaires . service BNC',
             'entreprise . chiffre d\'affaires . service BIC',
             'entreprise . chiffre d\'affaires . BIC',
             'entreprise . activité . nature . libérale . réglementée',
             'entreprise . activité . nature',
             'dirigeant . auto-entrepreneur . Cipav . adhérent',
             'date'],
    /** @type {string} */
    description: 'Il s’agit du revenu après déductions des cotisations, avant le paiement de l’impôt sur le revenu.',
    /** Custom meta of rule "dirigeant . auto-entrepreneur . revenu net" */
    meta: {"identifiant court":"auto-entrepreneur-net","résumé":"Avant impôt","question":"Quel revenu avant impôt voulez-vous toucher ?"} /** @type {const} */,
  },
  'dirigeant . auto-entrepreneur . cotisations et contributions': {
    /**
     * Parameters of "dirigeant . auto-entrepreneur . cotisations et contributions"
     * @typedef {{
     *  'entreprise . date de création'?: Date
     *  'entreprise . chiffre d\'affaires . vente restauration hébergement'?: number
     *  'entreprise . chiffre d\'affaires . service BNC'?: number
     *  'entreprise . chiffre d\'affaires . service BIC'?: number
     *  'entreprise . chiffre d\'affaires . BIC'?: number
     *  'entreprise . activité . nature . libérale . réglementée'?: boolean
     *  'entreprise . activité . nature'?: string
     *  'dirigeant . auto-entrepreneur . Cipav . adhérent'?: boolean
     *  'date'?: Date
     * }} dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributionsParams
     */
    /**
     * Evaluate "dirigeant . auto-entrepreneur . cotisations et contributions" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributionsParams, options?: Options) => {value: number, needed: Array<keyof dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributionsParams>, missing: Array<keyof dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributionsParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions, params, options),
    /** @type {"number"} */
    type: "number",
    /** @type {"€/an"} */
    unit: "€/an",
    /**
     * Parameter list for "dirigeant . auto-entrepreneur . cotisations et contributions"
     * @type {Array<keyof dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributionsParams>}
     */
    params: ['entreprise . date de création',
             'entreprise . chiffre d\'affaires . vente restauration hébergement',
             'entreprise . chiffre d\'affaires . service BNC',
             'entreprise . chiffre d\'affaires . service BIC',
             'entreprise . chiffre d\'affaires . BIC',
             'entreprise . activité . nature . libérale . réglementée',
             'entreprise . activité . nature',
             'dirigeant . auto-entrepreneur . Cipav . adhérent',
             'date'],
    /** Custom meta of rule "dirigeant . auto-entrepreneur . cotisations et contributions" */
    meta: {"références":{"Imposition du micro-entrepreneur (régime micro-fiscal et social)":"https://www.service-public.fr/professionnels-entreprises/vosdroits/F23267","Les cotisations et contributions sociales":"https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/lessentiel-du-statut.html#cout-durant-vie-auto-entreprise"}} /** @type {const} */,
  },
  /**
   * **Taxes pour frais de chambre**
   */
  'dirigeant . auto-entrepreneur . cotisations et contributions . TFC': {
    /**
     * Parameters of "dirigeant . auto-entrepreneur . cotisations et contributions . TFC"
     * @typedef {{
     *  'entreprise . chiffre d\'affaires . vente restauration hébergement'?: number
     *  'entreprise . chiffre d\'affaires . service BIC'?: number
     *  'entreprise . activité . nature'?: string
     * }} dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFCParams
     */
    /**
     * Evaluate "dirigeant . auto-entrepreneur . cotisations et contributions . TFC" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFCParams, options?: Options) => {value: number, needed: Array<keyof dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFCParams>, missing: Array<keyof dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFCParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFC, params, options),
    /** @type {"number"} */
    type: "number",
    /** @type {"€/an"} */
    unit: "€/an",
    /**
     * Parameter list for "dirigeant . auto-entrepreneur . cotisations et contributions . TFC"
     * @type {Array<keyof dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_TFCParams>}
     */
    params: ['entreprise . chiffre d\'affaires . vente restauration hébergement',
             'entreprise . chiffre d\'affaires . service BIC',
             'entreprise . activité . nature'],
    /** @type {string} */
    title: 'Taxes pour frais de chambre',
    /** @type {string} */
    note: 'Nous n’avons pas intégré les exceptions suivantes :\n- Artisans en double immatriculation CCI-CMA\n',
    /** Custom meta of rule "dirigeant . auto-entrepreneur . cotisations et contributions . TFC" */
    meta: {"références":{"Fiche service-public.fr":"https://www.service-public.fr/professionnels-entreprises/vosdroits/F32847"}} /** @type {const} */,
  },
  /**
   * Les cotisations sociales donnent à l’auto-entrepreneur accès à une
   * protection sociale minimale : une retraite, des soins de santé, des
   * allocations familiales, etc.
   *
   * L’auto-entreprise est un régime simplifié : plutôt qu’une fiche de paie
   * complexe, toutes les cotisations sont regroupées dans un *forfait* dont le
   * taux dépend de la catégorie d’activité.
   */
  'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations': {
    /**
     * Parameters of "dirigeant . auto-entrepreneur . cotisations et contributions . cotisations"
     * @typedef {{
     *  'entreprise . date de création'?: Date
     *  'entreprise . chiffre d\'affaires . vente restauration hébergement'?: number
     *  'entreprise . chiffre d\'affaires . service BNC'?: number
     *  'entreprise . chiffre d\'affaires . service BIC'?: number
     *  'entreprise . activité . nature . libérale . réglementée'?: boolean
     *  'entreprise . activité . nature'?: string
     *  'dirigeant . auto-entrepreneur . Cipav . adhérent'?: boolean
     *  'date'?: Date
     * }} dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisationsParams
     */
    /**
     * Evaluate "dirigeant . auto-entrepreneur . cotisations et contributions . cotisations" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisationsParams, options?: Options) => {value: number, needed: Array<keyof dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisationsParams>, missing: Array<keyof dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisationsParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisations, params, options),
    /** @type {"number"} */
    type: "number",
    /** @type {"€/an"} */
    unit: "€/an",
    /**
     * Parameter list for "dirigeant . auto-entrepreneur . cotisations et contributions . cotisations"
     * @type {Array<keyof dirigeant_·_auto__t__entrepreneur_·_cotisations_et_contributions_·_cotisationsParams>}
     */
    params: ['entreprise . date de création',
             'entreprise . chiffre d\'affaires . vente restauration hébergement',
             'entreprise . chiffre d\'affaires . service BNC',
             'entreprise . chiffre d\'affaires . service BIC',
             'entreprise . activité . nature . libérale . réglementée',
             'entreprise . activité . nature',
             'dirigeant . auto-entrepreneur . Cipav . adhérent',
             'date'],
    /** @type {string} */
    description: 'Les cotisations sociales donnent à l’auto-entrepreneur accès à une\nprotection sociale minimale : une retraite, des soins de santé, des\nallocations familiales, etc.\n\nL’auto-entreprise est un régime simplifié : plutôt qu’une fiche de paie\ncomplexe, toutes les cotisations sont regroupées dans un *forfait* dont le\ntaux dépend de la catégorie d’activité.\n',
    /** Custom meta of rule "dirigeant . auto-entrepreneur . cotisations et contributions . cotisations" */
    meta: {"références":{"Les cotisations et contributions sociales":"https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/lessentiel-du-statut.html#cout-durant-vie-auto-entreprise","Cotisations et contributions sociales : montant et déclaration":"https://entreprendre.service-public.fr/vosdroits/F36232#fiche-item-aria-2","Droit à la retraite des travailleurs indépendants relevant du dispositif micro-social":"https://legislation.lassuranceretraite.fr/Pdf/circulaire_cnav_2024_23_16072024.pdf"}} /** @type {const} */,
  },
  'entreprise . chiffre d\'affaires': {
    /**
     * Parameters of "entreprise . chiffre d'affaires"
     * @typedef {{
     *  'entreprise . chiffre d\'affaires . vente restauration hébergement'?: number
     *  'entreprise . chiffre d\'affaires . service BNC'?: number
     *  'entreprise . chiffre d\'affaires . service BIC'?: number
     *  'entreprise . chiffre d\'affaires . BIC'?: number
     * }} entreprise_·_chiffre_dʹaffairesParams
     */
    /**
     * Evaluate "entreprise . chiffre d'affaires" with evaluation trace, and information on
     * missing and needed parameters.
     * @type {(params?: entreprise_·_chiffre_dʹaffairesParams, options?: Options) => {value: number, needed: Array<keyof entreprise_·_chiffre_dʹaffairesParams>, missing: Array<keyof entreprise_·_chiffre_dʹaffairesParams>, trace: Trace}}
     */
    evaluate: (params = {}, options) =>
      $evaluate(_entreprise_·_chiffre_dʹaffaires, params, options),
    /** @type {"number"} */
    type: "number",
    /** @type {"€/an"} */
    unit: "€/an",
    /**
     * Parameter list for "entreprise . chiffre d'affaires"
     * @type {Array<keyof entreprise_·_chiffre_dʹaffairesParams>}
     */
    params: ['entreprise . chiffre d\'affaires . vente restauration hébergement',
             'entreprise . chiffre d\'affaires . service BNC',
             'entreprise . chiffre d\'affaires . service BIC',
             'entreprise . chiffre d\'affaires . BIC'],
  }
}

export const parameters = {
  'entreprise . date de création': rules['entreprise . date de création'],
  'entreprise . chiffre d\'affaires . vente restauration hébergement': rules['entreprise . chiffre d\'affaires . vente restauration hébergement'],
  'entreprise . chiffre d\'affaires . service BNC': rules['entreprise . chiffre d\'affaires . service BNC'],
  'entreprise . chiffre d\'affaires . service BIC': rules['entreprise . chiffre d\'affaires . service BIC'],
  'entreprise . chiffre d\'affaires . BIC': rules['entreprise . chiffre d\'affaires . BIC'],
  'entreprise . activité . nature . libérale . réglementée': rules['entreprise . activité . nature . libérale . réglementée'],
  'entreprise . activité . nature': rules['entreprise . activité . nature'],
  'dirigeant . auto-entrepreneur . Cipav . adhérent': rules['dirigeant . auto-entrepreneur . Cipav . adhérent'],
  'date': rules['date'],
}

export const outputs = {
  'dirigeant . auto-entrepreneur . revenu net': rules['dirigeant . auto-entrepreneur . revenu net'],
  'dirigeant . auto-entrepreneur . cotisations et contributions': rules['dirigeant . auto-entrepreneur . cotisations et contributions'],
  'dirigeant . auto-entrepreneur . cotisations et contributions . TFC': rules['dirigeant . auto-entrepreneur . cotisations et contributions . TFC'],
  'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations': rules['dirigeant . auto-entrepreneur . cotisations et contributions . cotisations'],
  'entreprise . chiffre d\'affaires': rules['entreprise . chiffre d\'affaires'],
}

export default rules;
