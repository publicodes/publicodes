/**
 * @typedef {Date | number | string | null | undefined} Value
 * @typedef {number | null | undefined} PNumber
 * @typedef {boolean | null | undefined} PBoolean
 * @typedef {() => PNumber} LazyNumber
 * @typedef {() => PBoolean} LazyBoolean
 * @typedef {() => Value} LazyValue
 * /

/**
 * TODO:
 * - How to provide better information about the error (eg. rule name,
 *   operation, etc...)?
 * - Some function are factorizable, do we want to?
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
 * @param {PNumber} l
 * @param {PNumber} r
 * @returns {number | undefined}
 *
 * @specification
 * The addition operation is defined as follows by order of precedence:
 * - ∀ x. add(undefined, x) = add(x, undefined) = undefined
 * - ∀ x. add(x, null) = add(null, x) = x
 * - ∀ x. add(null, null) = 0
 * - ∀ x, y. add(x, y) = x + y
 */
function $add(l, r) {
	if (l === undefined || r === undefined) {
		return undefined
	}

	return (l ?? 0) + (r ?? 0)
}

/**
 * @param {PNumber} l
 * @param {PNumber} r
 * @returns {number | undefined}
 *
 * @specification
 * The subtraction operation is defined as follows by order of precedence:
 * - ∀ x. sub(undefined, x) = sub(x, undefined) = undefined
 * - ∀ x. sub(null, null) = 0
 * - ∀ x. sub(x, null) = x
 * - ∀ x. sub(null, x) = -x
 * - ∀ x, y. sub(x, y) = x - y
 */
function $sub(l, r) {
	if (l === undefined || r === undefined) {
		return undefined
	}

	return (l ?? 0) - (r ?? 0)
}

/**
 * @param {PNumber} l
 * @param {LazyNumber} right
 * @returns {number | null | undefined}
 *
 * @specification
 * The multiplication operation is defined as follows by order of precedence:
 * - ∀ x. mul(0, x) = mul(x, 0) = 0
 * - ∀ x. mul(undefined, x) = mul(x, undefined) = undefined
 * - ∀ x. mul(null, x) = mul(x, null) = null
 */
function $mul(l, right) {
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
 * @param {PNumber} l
 * @param {LazyNumber} right
 * @returns {number | null | undefined}
 *
 * @throws {RuntimeError} if the right operand is evaluated to zero.
 *
 * @specification
 * The division operation is defined as follows by order of precedence:
 * - ∀ x. div(0, x) = 0
 * - ∀ x. div(x, 0) = throw RuntimeError('Division by zero')
 * - ∀ x. div(undefined, x) = div(x, undefined) = undefined
 * - ∀ x. div(null, x) = div(x, null) = null
 * - ∀ x, y. div(x, y) = x / y
 */
function $div(l, right) {
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
 * @param {PNumber} l
 * @param {LazyNumber} right
 * @returns {number | undefined}
 *
 * @specification
 * The power operation is defined as follows by order of precedence:
 * - ∀ x. pow(0, x) = 0
 * - ∀ x. pow(x, 0) = 1
 * - ∀ x. pow(undefined, y) = pow(x, undefined) = undefined
 * - ∀ x. pow(x, null) = pow(null, x) = null
 * - ∀ x, y. pow(x, y) = x ** y
 */
function $pow(l, right) {
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
 * @param {Value} l
 * @param {Value} r
 * @returns {boolean | undefined}
 *
 * @specification
 * The equality operation is defined as follows by order of precedence:
 * - ∀ x. eq(undefined, x) = eq(x, undefined) = undefined
 * - ∀ x, y. eq(x, y) = x === y
 */
function $eq(l, r) {
	if (l === undefined || r === undefined) {
		return undefined
	}

	if (l instanceof Date && r instanceof Date) {
		return l.getTime() === r.getTime()
	}

	return l === r
}

/**
 * @param {Value} l
 * @param {Value} r
 * @returns {boolean | undefined}
 *
 * @specification
 * The inequality operation is defined as follows by order of precedence:
 * - ∀ x. neq(undefined, x) = neq(x, undefined) = undefined
 * - ∀ x, y. neq(x, y) = x !== y
 */
function $neq(l, r) {
	if (l === undefined || r === undefined) {
		return undefined
	}

	if (l instanceof Date && r instanceof Date) {
		return l.getTime() !== r.getTime()
	}

	return l !== r
}

/**
 * @param {Value} l
 * @param {LazyValue} right
 * @returns {boolean | null | undefined}
 *
 * @specification
 * The less than operation is defined as follows by order of precedence:
 * - ∀ x. lt(null, x) = lt(x, null) = null
 * - ∀ x. lt(undefined, x) = lt(x, undefined) = undefined
 * - ∀ x, y. lt(x, y) = x < y
 */
function $lt(l, right) {
	if (l === null) {
		return null
	}

	const r = right()
	if (r === null) {
		return null
	}

	return l === undefined || r === undefined ? undefined : l < r
}

/**
 * @param {Value} l
 * @param {LazyValue} right
 * @returns {boolean | null | undefined}
 *
 * @specification
 * The greater than operation is defined as follows by order of precedence:
 * - ∀ x. gt(null, x) = gt(x, null) = null
 * - ∀ x. gt(undefined, x) = gt(x, undefined) = undefined
 * - ∀ x, y. lt(x, y) = x > y
 */
function $gt(l, right) {
	if (l === null) {
		return null
	}

	const r = right()
	if (r === null) {
		return null
	}

	return l === undefined || r === undefined ? undefined : l > r
}

/**
 * @param {Value} left
 * @param {LazyValue} right
 * @returns {boolean | null | undefined}
 *
 * @specification
 * The less than or equal is defined as follows by order of precedence:
 * - ∀ x. lte(null, x) = lte(x, null) = null
 * - ∀ x. lte(undefined, x) = lte(x, undefined) = undefined
 * - ∀ x, y. lte(x, y) = x <= y
 */
function $lte(l, right) {
	if (l === null) {
		return null
	}

	const r = right()
	if (r === null) {
		return null
	}

	return l === undefined || r === undefined ? undefined : l <= r
}

/**
 * @param {Value} l
 * @param {LazyValue} right
 * @returns {boolean | null | undefined}
 *
 * @specification
 * The greater than or equal is defined as follows by order of precedence:
 * - ∀ x. gte(null, x) = gte(x, null) = null
 * - ∀ x. gte(undefined, x) = gte(x, undefined) = undefined
 * - ∀ x, y. gte(x, y) = x <= y
 */
function $gte(l, right) {
	if (l === null) {
		return null
	}

	const r = right()
	if (r === null) {
		return null
	}

	return l === undefined || r === undefined ? undefined : l >= r
}

/**
 * @param {PBoolean} l
 * @param {LazyBoolean} right
 * @returns {boolean | undefined}
 *
 * @specification
 * The logical AND operation is defined as follows by order of precedence:
 * - ∀ x. and(true, x) = and(x, true) = true
 * - ∀ x. and(undefined, x) = and(x, undefined) = undefined
 * - ∀ x. and(null, x) = and(x, null) = false
 * - ∀ x, y. and(x, y) = x && y
 */
function $and(l, right) {
	if (l === null || l === false) {
		return false
	}

	const r = right()
	if (l === undefined) {
		return r === false ? false : undefined
	}

	if (r === undefined) {
		return undefined
	}

	return l === null || r === null ? false : l && r
}

/**
 * @param {PBoolean} l
 * @param {LazyBoolean} right
 * @returns {boolean | undefined}
 *
 * @specification
 * The logical OR operation is defined as follows by order of precedence:
 * - ∀ x. or(true, x) = or(x, true) = true
 * - ∀ x. or(undefined, x) = or(x, undefined) = undefined
 * - ∀ x. or(null, null) = false
 * - ∀ x. or(null, x) = or(x, null) = x
 * - ∀ x, y. or(x, y) = x || y
 */
function $or(l, right) {
	if (l === true) {
		return true
	}

	const r = right()
	if (l === undefined) {
		return r === true ? true : undefined
	}

	if (r === undefined) {
		return undefined
	}

	return (
		l === null && r === null ? false
		: l === null ? r
		: r === null ? l
		: l || r
	)
}

/** Unary operations */

/**
 * @param {number | null | undefined} val
 * @returns {number | undefined}
 * @specification
 * The unary negation operation is defined as follows by order of precedence:
 * 1. ∀ x. neg(undefined) = undefined
 * 2. ∀ x. neg(null) = 0
 * 3. ∀ x. neg(x) = -x
 */
function $neg(val) {
	if (val === undefined) {
		return undefined
	}

	return val === null ? 0 : -val
}

/**
 * @param {'up' | 'down' | 'nearest'} mode
 * @param {PNumber} val
 * @param {LazyNumber} precision
 * @returns {number | null | undefined}
 *
 * @throws {RuntimeError} if the precision is negative, equals to zero or not an integer.
 *
 * @specification
 * The rounding operation is defined as follows by order of precedence:
 * - ∀ x. round(mode, null, precision) = null
 * - ∀ x. round(mode, undefined, precision) = undefined
 * - ∀ x. round(mode, x, undefined) = undefined
 * - ∀ x. round(mode, x, null) = x
 * - ∀ x, p. round(mode, x, p) = rounded value of x with the given mode and precision p
 *    - if mode = 'up', round towards the nearest multiple of p greater than or equal to x
 *    - if mode = 'down', round towards the nearest multiple of p less than or equal to x
 *    - if mode = 'nearest', round to the nearest multiple of p
 */
function $round(mode, val, precision) {
	if (val === null) {
		return val
	}

	const p = precision()
	if (val === undefined || p === undefined) {
		return undefined
	}

	if (p === null) {
		return val
	}

	if (p <= 0) {
		throw new RuntimeError(
			'Rounding error: precision must be a positive number, got: ' + p,
		)
	}

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
 * @param {PNumber} left
 * @param {PNumber} right
 * @returns {number | undefined | null}
 *
 * @specification
 * The rounding operation is defined as follows by order of precedence:
 * - ∀ x. min(x, undefined) = min(undefined, x) = undefined
 * - ∀ x. min(x, null) = min(null, x) = x
 * - min(null, null) = null
 * - ∀ x, y. min(x, y) = the minimum value between x and y
 */
function $min(left, right) {
	if (left === undefined) {
		return undefined
	}

	if (right === undefined) {
		return undefined
	}

	if (left === null || right === null) {
		return left === null ? right : left
	}

	return left < right ? left : right
}

/**
 * @param {PNumber} left
 * @param {PNumber} right
 * @returns {number | undefined}
 *
 * @specification
 * The rounding operation is defined as follows by order of precedence:
 * - ∀ x. max(x, undefined) = max(undefined, x) = undefined
 * - ∀ x. max(x, null) = max(null, x) = x
 * - ∀ x, y. max(x, y) = the max value between x and y
 */
function $max(left, right) {
	if (left === undefined) {
		return undefined
	}

	if (right === undefined) {
		return undefined
	}

	if (left === null || right === null) {
		return left === null ? right : left
	}

	return left > right ? left : right
}

/**
 * @param {PBoolean} c
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
function $cond(c, ifTrue, ifFalse) {
	if (c === undefined) {
		return undefined
	}

	if (c === null) {
		return null
	}

	return c ? ifTrue() : ifFalse()
}

function $get(rule, ctx, params) {
	if (rule in ctx) {
		return ctx[rule]
	}

	params.push(rule)

	return ctx._global[rule]
}

const globalCache = {}
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
	const v = fn(ctx, params)
	return v
}

function $evaluate(fn, _global, options = {}) {
	const params = []
	const value = fn({ _global, _options: options }, params)
	const needed = Array.from(new Set(params))
	const missing = needed.filter((p) => !(p in _global))

	return { value, needed, missing }
}
