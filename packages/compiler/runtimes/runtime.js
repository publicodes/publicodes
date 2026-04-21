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
 *
 * Other types:
 * @typedef {string} RuleName
 * @typedef {Record<string, Value>} Trace
 * @typedef {{cache?: boolean, trace?: boolean}} Options
 * @typedef {{[rule: RuleName]: Value } & { _global: Partial<Record<RuleName, Value>>, _options: Options, _trace: Trace}} Context
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
	const ctx = { _global, _options: options, _trace: {} }
	const value = fn(ctx, params)
	const needed = Array.from(new Set(params))
	const missing = needed.filter((p) => !(p in _global))

	return { value, needed, missing, trace: ctx._trace }
}

/**
 * Return an evaluated value, and potentially hydrate the evaluation trace.
 *
 * @param {string} id
 * @param {Context} ctx
 * @param {Value} value
 * @returns {Value}
 */
function $ret(id, ctx, value) {
	if (ctx._options.trace) {
		ctx._trace[id] = value
	}
	return value
}

/**
 * Extract the value from an evaluation response.
 *
 * @param {Evaluated} params
 * @returns {Value}
 */
export function value(params) {
	return params.value
}

/**
 * Extract the needed from an evaluation response.
 *
 * @param {Evaluated} params
 * @returns {RuleName[]}
 */
export function needed(params) {
	return params.needed
}

/**
 * Extract the missing from an evaluation response.
 *
 * @param {Evaluated} params
 * @returns {RuleName[]}
 */
export function missing(params) {
	return params.missing
}

/**
 * Extract the trace from an evaluation response.
 *
 * @param {Evaluated} params
 * @returns {Trace}
 */
export function trace(params) {
	return params.trace
}

export const p = {
	NotDefined,
	NotApplicable,
	isNotDefined,
	isNotApplicable,
}
