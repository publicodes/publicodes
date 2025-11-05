/** Start embedded runtime */
/**
 * @typedef {Date | number | string | null | undefined} Value
 * @typedef {number | null | undefined} Number
 * @typedef {boolean | null | undefined} Boolean
 * @typedef {() => Number} LazyNumber
 * @typedef {() => Boolean} LazyBoolean
 * @typedef {() => Value} LazyValue
 */

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
 * @param {Number} left
 * @param {Number} right
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
 * @param {Number} left
 * @param {Number} right
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
 * @param {Number} left
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
 * @param {Number} left
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
 * @param {Number} left
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
 * @param {Value} left
 * @param {Value} right
 * @returns {boolean | undefined | null}
 *
 * @specification
 * The equality operation is defined as follows by order of precedence:
 * - ∀ x. eq(undefined, x) = eq(x, undefined) = undefined
 * - eq(null, null) = null
 * - eq(false, null) = true
 * - ∀ x, y. eq(x, y) = x === y
 */
function $eq(l, r) {
	if (l === undefined || r === undefined) {
		return undefined
	}

	if (l instanceof Date && r instanceof Date) {
		return l.getTime() === r.getTime()
	}

	// if ((l === null && r === false) || (l === false && r === null)) {
	// 	return true
	// }

	return l === r
}

/**
 * @param {Value} left
 * @param {Value} right
 * @returns {boolean | undefined}
 *
 * @specification
 * The inequality operation is defined as follows by order of precedence:
 * - ∀ x. neq(undefined, x) = neq(x, undefined) = undefined
 * - ∀ x. neq(false, null) = false
 * - ∀ x. neq(null, null) = null
 * - ∀ x, y. neq(x, y) = x !== y
 */
function $neq(l, r) {
	if (l === undefined || r === undefined) {
		return undefined
	}

	if (l instanceof Date && r instanceof Date) {
		return l.getTime() !== r.getTime()
	}

	// if ((l === null && r === false) || (l === false && r === null)) {
	// 	return false
	// }

	return l !== r
}

/**
 * @param {Value} left
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
 * @param {Value} left
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
 * @param {Value} left
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
 * @param {Boolean} left
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
 * @param {Boolean} left
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
 * @param {number | null | undefined} operand
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
 * @param {Number} val
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
 * @param {Number} left
 * @param {Number} right
 * @returns {number | undefined}
 *
 * @specification
 * The rounding operation is defined as follows by order of precedence:
 * - ∀ x. min(x, undefined) = min(undefined, x) = undefined
 * - ∀ x. min(x, null) = min(null, x) = x
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
 * @param {Number} left
 * @param {Number} right
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

function $ref(rule, fn, ctx, params) {
	if (rule in ctx || rule in ctx._global) {
		return $get(rule, ctx, params)
	}

	if (ctx._cache) {
		const cache = ctx._cache[rule] ?? new WeakMap()

		if (cache.has(ctx)) {
			return cache.get(ctx)
		}
		const value = fn(ctx, params)
		cache.set(ctx, value)
		ctx._cache[rule] = cache
		return value
	}
	const v = fn(ctx, params)
	return v
}

function $evaluate(fn, _global, options = {}) {
	const params = []
	const value = fn(
		{ _global, ...(options.cache ? { _cache: {} } : {}) },
		params,
	)
	const needed = Array.from(new Set(params))
	const missing = needed.filter((p) => !(p in _global))

	return { value, needed, missing }
}


/** End embedded runtime */

/** Compiled private Publicodes rules */


	/** @type {Fn<Date>}*/
	function _date(ctx, params) {
		return /** @type {Date} */ ($get("date", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _dirigeant(ctx, params) {
		return /** @type {unknown} */ ($get("dirigeant", ctx, params))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur(ctx, params) {
		return /** @type {boolean} */ ($cond(($eq($ref("dirigeant . régime social", _dirigeant___régime_social, ctx, params),  "auto-entrepreneur") === undefined), () => false, () => $eq($ref("dirigeant . régime social", _dirigeant___régime_social, ctx, params),  "auto-entrepreneur")))
	}

	/** @type {Fn<unknown>}*/
	function _dirigeant___auto_entrepreneur___Acre(ctx, params) {
		return /** @type {unknown} */ ($cond($or(($cond($or($eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  null), () =>  $or(($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params) === undefined), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  false))), () => $ref("dirigeant . exonérations . ACRE", _dirigeant___exonérations___ACRE, ctx, params), () => null) === undefined), () =>  $or($eq($cond($or($eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  null), () =>  $or(($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params) === undefined), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  false))), () => $ref("dirigeant . exonérations . ACRE", _dirigeant___exonérations___ACRE, ctx, params), () => null),  false), () =>  $eq($cond($or($eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  null), () =>  $or(($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params) === undefined), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  false))), () => $ref("dirigeant . exonérations . ACRE", _dirigeant___exonérations___ACRE, ctx, params), () => null),  null))), () => null, () => $get("dirigeant . auto-entrepreneur . Acre", ctx, params)))
	}

	/** @type {Fn<unknown>}*/
	function _dirigeant___auto_entrepreneur___Acre___notification_calcul_ACRE_annuel(ctx, params) {
		return /** @type {unknown} */ ($get("dirigeant . auto-entrepreneur . Acre . notification calcul ACRE annuel", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___Acre___taux_Acre(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($lt($ref("entreprise . date de création", _entreprise___date_de_création, ctx, params), () =>  new Date('2019-04-01')),  null), () =>  $eq($lt($ref("entreprise . date de création", _entreprise___date_de_création, ctx, params), () =>  new Date('2019-04-01')),  false)), () => $cond($or($eq($lt($ref("entreprise . date de création", _entreprise___date_de_création, ctx, params), () =>  new Date('2020-04-01')),  null), () =>  $eq($lt($ref("entreprise . date de création", _entreprise___date_de_création, ctx, params), () =>  new Date('2020-04-01')),  false)), () => $cond($or($eq($lt($ref("entreprise . durée d'activité", _entreprise___durée_d_activité, ctx, params), () =>  1),  null), () =>  $eq($lt($ref("entreprise . durée d'activité", _entreprise___durée_d_activité, ctx, params), () =>  1),  false)), () => null, () => 50), () => 75), () => 25))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___Acre___taux_CIPAV(ctx, params) {
		return /** @type {number} */ ($cond($or(($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params) === undefined), () =>  $or($eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  false), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  null))), () => null, () => $cond($or($eq($gte($ref("entreprise . date de création", _entreprise___date_de_création, ctx, params), () =>  new Date('2020-04-01')),  null), () =>  $eq($gte($ref("entreprise . date de création", _entreprise___date_de_création, ctx, params), () =>  new Date('2020-04-01')),  false)), () => $mul($mul($ref("dirigeant . auto-entrepreneur . Acre . taux Acre", _dirigeant___auto_entrepreneur___Acre___taux_Acre, ctx, params), () =>  $cond($neq($ref("dirigeant . auto-entrepreneur . DROM . taux CIPAV", _dirigeant___auto_entrepreneur___DROM___taux_CIPAV, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . DROM . taux CIPAV", _dirigeant___auto_entrepreneur___DROM___taux_CIPAV, ctx, params), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___taux, ctx, params))), () =>  0.01), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 12.1, () => 13.9))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___Acre___taux_service_BIC(ctx, params) {
		return /** @type {number} */ ($cond($or(($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params) === undefined), () =>  $or($eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  false), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  null))), () => null, () => $round('nearest', $mul($mul($ref("dirigeant . auto-entrepreneur . Acre . taux Acre", _dirigeant___auto_entrepreneur___Acre___taux_Acre, ctx, params), () =>  $cond($neq($ref("dirigeant . auto-entrepreneur . DROM . taux service BIC", _dirigeant___auto_entrepreneur___DROM___taux_service_BIC, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . DROM . taux service BIC", _dirigeant___auto_entrepreneur___DROM___taux_service_BIC, ctx, params), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___taux, ctx, params))), () =>  0.01), () => $pow(10, () =>  (- 1)))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___Acre___taux_service_BNC(ctx, params) {
		return /** @type {number} */ ($cond($or(($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params) === undefined), () =>  $or($eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  false), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  null))), () => null, () => $round('nearest', $mul($mul($ref("dirigeant . auto-entrepreneur . Acre . taux Acre", _dirigeant___auto_entrepreneur___Acre___taux_Acre, ctx, params), () =>  $cond($neq($ref("dirigeant . auto-entrepreneur . DROM . taux service BNC", _dirigeant___auto_entrepreneur___DROM___taux_service_BNC, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . DROM . taux service BNC", _dirigeant___auto_entrepreneur___DROM___taux_service_BNC, ctx, params), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___taux, ctx, params))), () =>  0.01), () => $pow(10, () =>  (- $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  false)), () => 1, () => 2))))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___Acre___taux_vente_restauration_hébergement(ctx, params) {
		return /** @type {number} */ ($cond($or(($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params) === undefined), () =>  $or($eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  false), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  null))), () => null, () => $round('nearest', $mul($mul($ref("dirigeant . auto-entrepreneur . Acre . taux Acre", _dirigeant___auto_entrepreneur___Acre___taux_Acre, ctx, params), () =>  $cond($neq($ref("dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement", _dirigeant___auto_entrepreneur___DROM___taux_vente_restauration_hébergement, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement", _dirigeant___auto_entrepreneur___DROM___taux_vente_restauration_hébergement, ctx, params), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___taux, ctx, params))), () =>  0.01), () => $pow(10, () =>  (- 1)))))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___Cipav(ctx, params) {
		return /** @type {boolean} */ ($or($ref("entreprise . activité . nature . libérale . réglementée", _entreprise___activité___nature___libérale___réglementée, ctx, params), () =>  $or($and($eq($ref("entreprise . activité . nature", _entreprise___activité___nature, ctx, params),  "libérale"), () =>  $and($lt($ref("entreprise . date de création", _entreprise___date_de_création, ctx, params), () =>  new Date('2018-01')), () =>  $and($eq($ref("dirigeant . auto-entrepreneur . Cipav . adhérent", _dirigeant___auto_entrepreneur___Cipav___adhérent, ctx, params),  true), () =>  true))), () =>  false)))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___Cipav___adhérent(ctx, params) {
		return /** @type {boolean} */ ($cond(($get("dirigeant . auto-entrepreneur . Cipav . adhérent", ctx, params) === undefined), () => false, () => $get("dirigeant . auto-entrepreneur . Cipav . adhérent", ctx, params)))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___Cipav___retraite_complémentaire(ctx, params) {
		return /** @type {number} */ ($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___retraite_complémentaire, ctx, params))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___DROM(ctx, params) {
		return /** @type {boolean} */ ($cond($or(($ref("établissement . commune . département . outre-mer", _établissement___commune___département___outre_mer, ctx, params) === undefined), () =>  $or($eq($ref("établissement . commune . département . outre-mer", _établissement___commune___département___outre_mer, ctx, params),  false), () =>  $eq($ref("établissement . commune . département . outre-mer", _établissement___commune___département___outre_mer, ctx, params),  null))), () => null, () => true))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___DROM___première_période(ctx, params) {
		return /** @type {boolean} */ ($lte($ref("entreprise . durée d'activité . trimestres civils", _entreprise___durée_d_activité___trimestres_civils, ctx, params), () =>  8))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___DROM___seconde_période(ctx, params) {
		return /** @type {boolean} */ ($lte($ref("entreprise . durée d'activité . années civiles", _entreprise___durée_d_activité___années_civiles, ctx, params), () =>  3))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___DROM___taux_CIPAV(ctx, params) {
		return /** @type {number} */ ($cond($or(($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params) === undefined), () =>  $or($eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  false), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  null))), () => null, () => $cond($or($eq($ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant___auto_entrepreneur___DROM___première_période, ctx, params),  null), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant___auto_entrepreneur___DROM___première_période, ctx, params),  false)), () => $cond($or($eq($ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant___auto_entrepreneur___DROM___seconde_période, ctx, params),  null), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant___auto_entrepreneur___DROM___seconde_période, ctx, params),  false)), () => 14.2, () => 10.6), () => 7.1)))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___DROM___taux_service_BIC(ctx, params) {
		return /** @type {number} */ ($cond($or(($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params) === undefined), () =>  $or($eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  false), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  null))), () => null, () => $cond($or($eq($ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant___auto_entrepreneur___DROM___première_période, ctx, params),  null), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant___auto_entrepreneur___DROM___première_période, ctx, params),  false)), () => $cond($or($eq($ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant___auto_entrepreneur___DROM___seconde_période, ctx, params),  null), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant___auto_entrepreneur___DROM___seconde_période, ctx, params),  false)), () => 14.2, () => 10.6), () => 3.6)))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___DROM___taux_service_BNC(ctx, params) {
		return /** @type {number} */ ($cond($or(($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params) === undefined), () =>  $or($eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  false), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  null))), () => null, () => $cond($or($eq($ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant___auto_entrepreneur___DROM___première_période, ctx, params),  null), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant___auto_entrepreneur___DROM___première_période, ctx, params),  false)), () => $cond($or($eq($ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant___auto_entrepreneur___DROM___seconde_période, ctx, params),  null), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant___auto_entrepreneur___DROM___seconde_période, ctx, params),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 14.1, () => 15.4), () => 16.4), () => 17.4), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 10.6, () => 11.6), () => 12.3), () => 13.1)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 3.6, () => 3.9), () => 4.1), () => 4.4))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___DROM___taux_vente_restauration_hébergement(ctx, params) {
		return /** @type {number} */ ($cond($or(($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params) === undefined), () =>  $or($eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  false), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM", _dirigeant___auto_entrepreneur___DROM, ctx, params),  null))), () => null, () => $cond($or($eq($ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant___auto_entrepreneur___DROM___première_période, ctx, params),  null), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM . première période", _dirigeant___auto_entrepreneur___DROM___première_période, ctx, params),  false)), () => $cond($or($eq($ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant___auto_entrepreneur___DROM___seconde_période, ctx, params),  null), () =>  $eq($ref("dirigeant . auto-entrepreneur . DROM . seconde période", _dirigeant___auto_entrepreneur___DROM___seconde_période, ctx, params),  false)), () => 8.199999999999999, () => 6.2), () => 2.1)))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___affiliation_CIPAV(ctx, params) {
		return /** @type {boolean} */ ($ref("dirigeant . auto-entrepreneur . Cipav", _dirigeant___auto_entrepreneur___Cipav, ctx, params))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___chiffre_d_affaires(ctx, params) {
		return /** @type {number} */ ($get("dirigeant . auto-entrepreneur . chiffre d'affaires", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions(ctx, params) {
		return /** @type {number} */ ($add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . CFP", _dirigeant___auto_entrepreneur___cotisations_et_contributions___CFP, ctx, params),  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations, ctx, params))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___CFP(ctx, params) {
		return /** @type {number} */ ($add($mul($mul($cond($or($eq($and($lt($ref("date", _date, ctx, params), () =>  new Date('2022-01')), () =>  $and($eq($ref("dirigeant . auto-entrepreneur . Cipav", _dirigeant___auto_entrepreneur___Cipav, ctx, params),  false), () =>  true)),  null), () =>  $eq($and($lt($ref("date", _date, ctx, params), () =>  new Date('2022-01')), () =>  $and($eq($ref("dirigeant . auto-entrepreneur . Cipav", _dirigeant___auto_entrepreneur___Cipav, ctx, params),  false), () =>  true)),  false)), () => 0.2, () => 0.1), () =>  $ref("entreprise . chiffre d'affaires . service BNC", _entreprise___chiffre_d_affaires___service_BNC, ctx, params)), () =>  0.01),  $mul($mul($cond($or($eq($eq($ref("entreprise . activité . nature", _entreprise___activité___nature, ctx, params),  "artisanale"),  null), () =>  $eq($eq($ref("entreprise . activité . nature", _entreprise___activité___nature, ctx, params),  "artisanale"),  false)), () => 0.1, () => 0.3), () =>  $ref("entreprise . chiffre d'affaires . BIC", _entreprise___chiffre_d_affaires___BIC, ctx, params)), () =>  0.01)))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC(ctx, params) {
		return /** @type {number} */ ($add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers, ctx, params),  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___commerce, ctx, params)))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___commerce(ctx, params) {
		return /** @type {number} */ ($cond($or(($eq($ref("entreprise . activité . nature", _entreprise___activité___nature, ctx, params),  "commerciale") === undefined), () =>  $or($eq($eq($ref("entreprise . activité . nature", _entreprise___activité___nature, ctx, params),  "commerciale"),  false), () =>  $eq($eq($ref("entreprise . activité . nature", _entreprise___activité___nature, ctx, params),  "commerciale"),  null))), () => null, () => $add($round('nearest', $mul($mul(0.015, () =>  $ref("entreprise . chiffre d'affaires . vente restauration hébergement", _entreprise___chiffre_d_affaires___vente_restauration_hébergement, ctx, params)), () =>  0.01), () => $cond(true, () => 1, () => null)),  $round('nearest', $mul($mul(0.044, () =>  $ref("entreprise . chiffre d'affaires . service BIC", _entreprise___chiffre_d_affaires___service_BIC, ctx, params)), () =>  0.01), () => $cond(true, () => 1, () => null)))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers(ctx, params) {
		return /** @type {number} */ ($cond($or(($eq($ref("entreprise . activité . nature", _entreprise___activité___nature, ctx, params),  "artisanale") === undefined), () =>  $or($eq($eq($ref("entreprise . activité . nature", _entreprise___activité___nature, ctx, params),  "artisanale"),  false), () =>  $eq($eq($ref("entreprise . activité . nature", _entreprise___activité___nature, ctx, params),  "artisanale"),  null))), () => null, () => $add($round('nearest', $mul($mul($cond($neq($ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux vente", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Moselle___taux_vente, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux vente", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Moselle___taux_vente, ctx, params), () => $cond($neq($ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux vente", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Alsace___taux_vente, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux vente", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Alsace___taux_vente, ctx, params), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_vente, ctx, params))), () =>  $ref("entreprise . chiffre d'affaires . vente restauration hébergement", _entreprise___chiffre_d_affaires___vente_restauration_hébergement, ctx, params)), () =>  0.01), () => $cond(true, () => 1, () => null)),  $round('nearest', $mul($mul($cond($neq($ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux service", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Moselle___taux_service, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux service", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Moselle___taux_service, ctx, params), () => $cond($neq($ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux service", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Alsace___taux_service, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux service", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Alsace___taux_service, ctx, params), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux service", _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_service, ctx, params))), () =>  $ref("entreprise . chiffre d'affaires . service BIC", _entreprise___chiffre_d_affaires___service_BIC, ctx, params)), () =>  0.01), () => $cond(true, () => 1, () => null)))))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Alsace(ctx, params) {
		return /** @type {boolean} */ ($cond(($or($eq($ref("établissement . commune . département", _établissement___commune___département, ctx, params),  "Bas-Rhin"), () =>  $or($eq($ref("établissement . commune . département", _établissement___commune___département, ctx, params),  "Haut-Rhin"), () =>  false)) === undefined), () => false, () => $or($eq($ref("établissement . commune . département", _établissement___commune___département, ctx, params),  "Bas-Rhin"), () =>  $or($eq($ref("établissement . commune . département", _établissement___commune___département, ctx, params),  "Haut-Rhin"), () =>  false))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Alsace___taux_service(ctx, params) {
		return /** @type {number} */ (0.65)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Alsace___taux_vente(ctx, params) {
		return /** @type {number} */ (0.29)
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Moselle(ctx, params) {
		return /** @type {boolean} */ ($cond(($eq($ref("établissement . commune . département", _établissement___commune___département, ctx, params),  "Moselle") === undefined), () => false, () => $eq($ref("établissement . commune . département", _établissement___commune___département, ctx, params),  "Moselle")))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Moselle___taux_service(ctx, params) {
		return /** @type {number} */ (0.83)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_Moselle___taux_vente(ctx, params) {
		return /** @type {number} */ (0.37)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_service(ctx, params) {
		return /** @type {number} */ (0.48)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC___métiers___taux_vente(ctx, params) {
		return /** @type {number} */ (0.22)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations(ctx, params) {
		return /** @type {number} */ ($add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav, ctx, params),  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC, ctx, params)))))
	}

	/** @type {Fn<unknown>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___répartition(ctx, params) {
		return /** @type {unknown} */ ($get("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___répartition___autres_contributions(ctx, params) {
		return /** @type {number} */ ($add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___autres_contributions, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___autres_contributions, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___autres_contributions, ctx, params),  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___autres_contributions, ctx, params)))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___répartition___formation_professionnelle(ctx, params) {
		return /** @type {number} */ ($ref("dirigeant . auto-entrepreneur . cotisations et contributions . CFP", _dirigeant___auto_entrepreneur___cotisations_et_contributions___CFP, ctx, params))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___répartition___invalidité_décès(ctx, params) {
		return /** @type {number} */ ($add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___invalidité_décès, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___invalidité_décès, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___invalidité_décès, ctx, params),  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___invalidité_décès, ctx, params)))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___répartition___maladie_maternité(ctx, params) {
		return /** @type {number} */ ($add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___maladie_maternité, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___maladie_maternité, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___maladie_maternité, ctx, params),  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___maladie_maternité, ctx, params)))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___répartition___retraite(ctx, params) {
		return /** @type {number} */ ($add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___répartition___retraite_complémentaire, ctx, params),  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___répartition___retraite_de_base, ctx, params)))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___répartition___retraite_complémentaire(ctx, params) {
		return /** @type {number} */ ($add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___retraite_complémentaire, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___retraite_complémentaire, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___retraite_complémentaire, ctx, params),  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___retraite_complémentaire, ctx, params)))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___répartition___retraite_de_base(ctx, params) {
		return /** @type {number} */ ($add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___retraite_de_base, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___retraite_de_base, ctx, params),  $add($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___retraite_de_base, ctx, params),  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___retraite_de_base, ctx, params)))))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC(ctx, params) {
		return /** @type {number} */ ($mul($mul($cond($neq($ref("dirigeant . auto-entrepreneur . DROM . taux service BIC", _dirigeant___auto_entrepreneur___DROM___taux_service_BIC, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . DROM . taux service BIC", _dirigeant___auto_entrepreneur___DROM___taux_service_BIC, ctx, params), () => $cond($neq($ref("dirigeant . auto-entrepreneur . Acre . taux service BIC", _dirigeant___auto_entrepreneur___Acre___taux_service_BIC, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . Acre . taux service BIC", _dirigeant___auto_entrepreneur___Acre___taux_service_BIC, ctx, params), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___taux, ctx, params))), () =>  $ref("entreprise . chiffre d'affaires . service BIC", _entreprise___chiffre_d_affaires___service_BIC, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<unknown>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition(ctx, params) {
		return /** @type {unknown} */ ($get("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___autres_contributions(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___autres_contributions___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___autres_contributions___taux_de_répartition(ctx, params) {
		return /** @type {number} */ (29.7)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___invalidité_décès(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___invalidité_décès___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___invalidité_décès___taux_de_répartition(ctx, params) {
		return /** @type {number} */ (3.1)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___maladie_maternité(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___maladie_maternité___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___maladie_maternité___taux_de_répartition(ctx, params) {
		return /** @type {number} */ (8.9)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___retraite_complémentaire(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___retraite_complémentaire___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___retraite_complémentaire___taux_de_répartition(ctx, params) {
		return /** @type {number} */ (16.5)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___retraite_de_base(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___retraite_de_base___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___répartition___retraite_de_base___taux_de_répartition(ctx, params) {
		return /** @type {number} */ (41.8)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BIC___taux(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2022-10')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2022-10')),  false)), () => 22, () => 21.2))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC(ctx, params) {
		return /** @type {number} */ ($cond($or(($gt($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav, ctx, params), () =>  0) === undefined), () =>  $or($eq($gt($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav, ctx, params), () =>  0),  false), () =>  $eq($gt($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav, ctx, params), () =>  0),  null))), () => $mul($mul($cond($neq($ref("dirigeant . auto-entrepreneur . DROM . taux service BNC", _dirigeant___auto_entrepreneur___DROM___taux_service_BNC, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . DROM . taux service BNC", _dirigeant___auto_entrepreneur___DROM___taux_service_BNC, ctx, params), () => $cond($neq($ref("dirigeant . auto-entrepreneur . Acre . taux service BNC", _dirigeant___auto_entrepreneur___Acre___taux_service_BNC, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . Acre . taux service BNC", _dirigeant___auto_entrepreneur___Acre___taux_service_BNC, ctx, params), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___taux, ctx, params))), () =>  $ref("entreprise . chiffre d'affaires . service BNC", _entreprise___chiffre_d_affaires___service_BNC, ctx, params)), () =>  0.01), () => null))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav(ctx, params) {
		return /** @type {number} */ ($cond($or(($ref("dirigeant . auto-entrepreneur . Cipav", _dirigeant___auto_entrepreneur___Cipav, ctx, params) === undefined), () =>  $or($eq($ref("dirigeant . auto-entrepreneur . Cipav", _dirigeant___auto_entrepreneur___Cipav, ctx, params),  false), () =>  $eq($ref("dirigeant . auto-entrepreneur . Cipav", _dirigeant___auto_entrepreneur___Cipav, ctx, params),  null))), () => null, () => $mul($mul($cond($neq($ref("dirigeant . auto-entrepreneur . DROM . taux CIPAV", _dirigeant___auto_entrepreneur___DROM___taux_CIPAV, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . DROM . taux CIPAV", _dirigeant___auto_entrepreneur___DROM___taux_CIPAV, ctx, params), () => $cond($neq($ref("dirigeant . auto-entrepreneur . Acre . taux CIPAV", _dirigeant___auto_entrepreneur___Acre___taux_CIPAV, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . Acre . taux CIPAV", _dirigeant___auto_entrepreneur___Acre___taux_CIPAV, ctx, params), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___taux, ctx, params))), () =>  $ref("entreprise . chiffre d'affaires . service BNC", _entreprise___chiffre_d_affaires___service_BNC, ctx, params)), () =>  0.01)))
	}

	/** @type {Fn<unknown>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition(ctx, params) {
		return /** @type {unknown} */ ($get("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___autres_contributions(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___autres_contributions___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___autres_contributions___taux_de_répartition(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 36.3, () => 34))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___invalidité_décès(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___invalidité_décès___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___invalidité_décès___taux_de_répartition(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 2.6, () => 1.4))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___maladie_maternité(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___maladie_maternité___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___maladie_maternité___taux_de_répartition(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 9.050000000000001, () => 10.2))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___retraite_complémentaire(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___retraite_complémentaire___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___retraite_complémentaire___taux_de_répartition(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 20.75, () => 25.6))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___retraite_de_base(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___retraite_de_base___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___répartition___retraite_de_base___taux_de_répartition(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 31.3, () => 28.8))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC_Cipav___taux(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 21.2, () => 23.2))
	}

	/** @type {Fn<unknown>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition(ctx, params) {
		return /** @type {unknown} */ ($get("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___autres_contributions(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___autres_contributions___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___autres_contributions___taux_de_répartition(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 36.5, () => 34.1), () => 32.5), () => 31.2))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___invalidité_décès(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___invalidité_décès___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___invalidité_décès___taux_de_répartition(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 4.1, () => 3.7), () => 3.5), () => 3.25))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___maladie_maternité(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___maladie_maternité___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___maladie_maternité___taux_de_répartition(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 3.9, () => 3.6), () => 3.4), () => 3))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___retraite_complémentaire(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___retraite_complémentaire___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___retraite_complémentaire___taux_de_répartition(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 0, () => 7.85), () => 13), () => 17.7))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___retraite_de_base(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___retraite_de_base___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___répartition___retraite_de_base___taux_de_répartition(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => 55.5, () => 50.75), () => 47.6), () => 44.85))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___service_BNC___taux(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2026-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2025-01')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2024-07')),  false)), () => $cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2022-10')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2022-10')),  false)), () => 22, () => 21.1), () => 23.1), () => 24.6), () => 26.1))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement(ctx, params) {
		return /** @type {number} */ ($mul($mul($cond($neq($ref("dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement", _dirigeant___auto_entrepreneur___DROM___taux_vente_restauration_hébergement, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement", _dirigeant___auto_entrepreneur___DROM___taux_vente_restauration_hébergement, ctx, params), () => $cond($neq($ref("dirigeant . auto-entrepreneur . Acre . taux vente restauration hébergement", _dirigeant___auto_entrepreneur___Acre___taux_vente_restauration_hébergement, ctx, params),  null), () => $ref("dirigeant . auto-entrepreneur . Acre . taux vente restauration hébergement", _dirigeant___auto_entrepreneur___Acre___taux_vente_restauration_hébergement, ctx, params), () => $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___taux, ctx, params))), () =>  $ref("entreprise . chiffre d'affaires . vente restauration hébergement", _entreprise___chiffre_d_affaires___vente_restauration_hébergement, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<unknown>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition(ctx, params) {
		return /** @type {unknown} */ ($get("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___autres_contributions(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___autres_contributions___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___autres_contributions___taux_de_répartition(ctx, params) {
		return /** @type {number} */ (29.7)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___invalidité_décès(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___invalidité_décès___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___invalidité_décès___taux_de_répartition(ctx, params) {
		return /** @type {number} */ (3.1)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___maladie_maternité(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___maladie_maternité___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___maladie_maternité___taux_de_répartition(ctx, params) {
		return /** @type {number} */ (8.9)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___retraite_complémentaire(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___retraite_complémentaire___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___retraite_complémentaire___taux_de_répartition(ctx, params) {
		return /** @type {number} */ (16.5)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___retraite_de_base(ctx, params) {
		return /** @type {number} */ ($mul($mul($ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement, ctx, params), () =>  $ref("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition", _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___retraite_de_base___taux_de_répartition, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___répartition___retraite_de_base___taux_de_répartition(ctx, params) {
		return /** @type {number} */ (41.8)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations___vente_restauration_hébergement___taux(ctx, params) {
		return /** @type {number} */ ($cond($or($eq($gte($ref("date", _date, ctx, params), () =>  new Date('2022-10')),  null), () =>  $eq($gte($ref("date", _date, ctx, params), () =>  new Date('2022-10')),  false)), () => 12.8, () => 12.3))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___impôt(ctx, params) {
		return /** @type {boolean} */ (true)
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___impôt___revenu_imposable(ctx, params) {
		return /** @type {number} */ ($ref("entreprise . imposition . régime . micro-entreprise . revenu abattu", _entreprise___imposition___régime___micro_entreprise___revenu_abattu, ctx, params))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___impôt___versement_libératoire(ctx, params) {
		return /** @type {boolean} */ ($cond(($get("dirigeant . auto-entrepreneur . impôt . versement libératoire", ctx, params) === undefined), () => false, () => $get("dirigeant . auto-entrepreneur . impôt . versement libératoire", ctx, params)))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___impôt___versement_libératoire___montant(ctx, params) {
		return /** @type {number} */ ($add($mul($mul(1.7, () =>  $ref("entreprise . chiffre d'affaires . service BIC", _entreprise___chiffre_d_affaires___service_BIC, ctx, params)), () =>  0.01),  $add($mul($mul(2.2, () =>  $ref("entreprise . chiffre d'affaires . service BNC", _entreprise___chiffre_d_affaires___service_BNC, ctx, params)), () =>  0.01),  $mul($mul(1, () =>  $ref("entreprise . chiffre d'affaires . vente restauration hébergement", _entreprise___chiffre_d_affaires___vente_restauration_hébergement, ctx, params)), () =>  0.01))))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___impôt___versement_libératoire___seuil_dépassé(ctx, params) {
		return /** @type {boolean} */ ($gt($ref("impôt . foyer fiscal . revenu fiscal de référence", _impôt___foyer_fiscal___revenu_fiscal_de_référence, ctx, params), () =>  27519))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___revenu_net(ctx, params) {
		return /** @type {number} */ ($round('nearest', $sub($ref("entreprise . chiffre d'affaires", _entreprise___chiffre_d_affaires, ctx, params),  $ref("dirigeant . auto-entrepreneur . cotisations et contributions", _dirigeant___auto_entrepreneur___cotisations_et_contributions, ctx, params)), () => $cond(true, () => 1, () => null)))
	}

	/** @type {Fn<number>}*/
	function _dirigeant___auto_entrepreneur___revenu_net___après_impôt(ctx, params) {
		return /** @type {number} */ ($round('nearest', $sub($ref("dirigeant . auto-entrepreneur . revenu net", _dirigeant___auto_entrepreneur___revenu_net, ctx, params),  $ref("rémunération . impôt", _rémunération___impôt, ctx, params)), () => $cond(true, () => 1, () => null)))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___auto_entrepreneur___éligible_à_l_ACRE(ctx, params) {
		return /** @type {boolean} */ ($cond($or(($lt($ref("entreprise . durée d'activité . en début d'année", _entreprise___durée_d_activité___en_début_d_année, ctx, params), () =>  1) === undefined), () =>  $or($eq($lt($ref("entreprise . durée d'activité . en début d'année", _entreprise___durée_d_activité___en_début_d_année, ctx, params), () =>  1),  false), () =>  $eq($lt($ref("entreprise . durée d'activité . en début d'année", _entreprise___durée_d_activité___en_début_d_année, ctx, params), () =>  1),  null))), () => null, () => $cond(($get("dirigeant . auto-entrepreneur . éligible à l'ACRE", ctx, params) === undefined), () => false, () => $get("dirigeant . auto-entrepreneur . éligible à l'ACRE", ctx, params))))
	}

	/** @type {Fn<unknown>}*/
	function _dirigeant___exonérations(ctx, params) {
		return /** @type {unknown} */ ($get("dirigeant . exonérations", ctx, params))
	}

	/** @type {Fn<boolean>}*/
	function _dirigeant___exonérations___ACRE(ctx, params) {
		return /** @type {boolean} */ ($get("dirigeant . exonérations . ACRE", ctx, params))
	}

	/** @type {Fn<string>}*/
	function _dirigeant___régime_social(ctx, params) {
		return /** @type {string} */ ("auto-entrepreneur")
	}

	/** @type {Fn<unknown>}*/
	function _entreprise(ctx, params) {
		return /** @type {unknown} */ ($get("entreprise", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _entreprise___activité(ctx, params) {
		return /** @type {unknown} */ ($get("entreprise . activité", ctx, params))
	}

	/** @type {Fn<string>}*/
	function _entreprise___activité___nature(ctx, params) {
		return /** @type {string} */ ($get("entreprise . activité . nature", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _entreprise___activité___nature___libérale(ctx, params) {
		return /** @type {unknown} */ ($get("entreprise . activité . nature . libérale", ctx, params))
	}

	/** @type {Fn<boolean>}*/
	function _entreprise___activité___nature___libérale___réglementée(ctx, params) {
		return /** @type {boolean} */ ($get("entreprise . activité . nature . libérale . réglementée", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _entreprise___activités(ctx, params) {
		return /** @type {unknown} */ ($get("entreprise . activités", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _entreprise___activités___revenus_mixtes(ctx, params) {
		return /** @type {unknown} */ ($get("entreprise . activités . revenus mixtes", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _entreprise___chiffre_d_affaires(ctx, params) {
		return /** @type {number} */ ($add($ref("entreprise . chiffre d'affaires . service BIC", _entreprise___chiffre_d_affaires___service_BIC, ctx, params),  $add($ref("entreprise . chiffre d'affaires . service BNC", _entreprise___chiffre_d_affaires___service_BNC, ctx, params),  $add($ref("entreprise . chiffre d'affaires . vente restauration hébergement", _entreprise___chiffre_d_affaires___vente_restauration_hébergement, ctx, params),  $ref("entreprise . chiffre d'affaires . BIC", _entreprise___chiffre_d_affaires___BIC, ctx, params)))))
	}

	/** @type {Fn<number>}*/
	function _entreprise___chiffre_d_affaires___BIC(ctx, params) {
		return /** @type {number} */ ($get("entreprise . chiffre d'affaires . BIC", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _entreprise___chiffre_d_affaires___service_BIC(ctx, params) {
		return /** @type {number} */ ($get("entreprise . chiffre d'affaires . service BIC", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _entreprise___chiffre_d_affaires___service_BNC(ctx, params) {
		return /** @type {number} */ ($get("entreprise . chiffre d'affaires . service BNC", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _entreprise___chiffre_d_affaires___vente_restauration_hébergement(ctx, params) {
		return /** @type {number} */ ($get("entreprise . chiffre d'affaires . vente restauration hébergement", ctx, params))
	}

	/** @type {Fn<Date>}*/
	function _entreprise___date_de_création(ctx, params) {
		return /** @type {Date} */ ($get("entreprise . date de création", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _entreprise___durée_d_activité(ctx, params) {
		return /** @type {number} */ ($get("entreprise . durée d'activité", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _entreprise___durée_d_activité___années_civiles(ctx, params) {
		return /** @type {number} */ ($get("entreprise . durée d'activité . années civiles", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _entreprise___durée_d_activité___en_début_d_année(ctx, params) {
		return /** @type {number} */ ($get("entreprise . durée d'activité . en début d'année", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _entreprise___durée_d_activité___trimestres_civils(ctx, params) {
		return /** @type {number} */ ($get("entreprise . durée d'activité . trimestres civils", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _entreprise___imposition(ctx, params) {
		return /** @type {unknown} */ ($get("entreprise . imposition", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _entreprise___imposition___régime(ctx, params) {
		return /** @type {unknown} */ ($get("entreprise . imposition . régime", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _entreprise___imposition___régime___micro_entreprise(ctx, params) {
		return /** @type {unknown} */ ($get("entreprise . imposition . régime . micro-entreprise", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _entreprise___imposition___régime___micro_entreprise___revenu_abattu(ctx, params) {
		return /** @type {number} */ ($mul($mul(60, () =>  $ref("entreprise . chiffre d'affaires", _entreprise___chiffre_d_affaires, ctx, params)), () =>  0.01))
	}

	/** @type {Fn<unknown>}*/
	function _impôt(ctx, params) {
		return /** @type {unknown} */ ($get("impôt", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _impôt___foyer_fiscal(ctx, params) {
		return /** @type {unknown} */ ($get("impôt . foyer fiscal", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _impôt___foyer_fiscal___revenu_fiscal_de_référence(ctx, params) {
		return /** @type {number} */ ($get("impôt . foyer fiscal . revenu fiscal de référence", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _revenu_imposable(ctx, params) {
		return /** @type {unknown} */ ($get("revenu imposable", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _rémunération(ctx, params) {
		return /** @type {unknown} */ ($get("rémunération", ctx, params))
	}

	/** @type {Fn<number>}*/
	function _rémunération___impôt(ctx, params) {
		return /** @type {number} */ ($get("rémunération . impôt", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _établissement(ctx, params) {
		return /** @type {unknown} */ ($get("établissement", ctx, params))
	}

	/** @type {Fn<unknown>}*/
	function _établissement___commune(ctx, params) {
		return /** @type {unknown} */ ($get("établissement . commune", ctx, params))
	}

	/** @type {Fn<string>}*/
	function _établissement___commune___département(ctx, params) {
		return /** @type {string} */ ($get("établissement . commune . département", ctx, params))
	}

	/** @type {Fn<boolean>}*/
	function _établissement___commune___département___outre_mer(ctx, params) {
		return /** @type {boolean} */ ($get("établissement . commune . département . outre-mer", ctx, params))
	}

/** Exported outputs/inputs */

const rules = {
'date': {
		/**
		 * Parameters of "date"
		 * @typedef {{
				'date'?: Date | undefined
			}} DateParams
		 */
		/**
		 * Evaluate "date"
		 * @param {DateParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {Date | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_date, params, options).value,
		/**
		 * Evaluate "date" with information on missing and needed parameters
		 * @param {DateParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: Date | undefined | null; needed: Array<keyof DateParams>, missing: Array<keyof DateParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_date, params, options),
		/** @type {"date"} */
		type: "date",
		/** Parameter list for "date"
		 * @type {Array<keyof DateParams>}
		 */
		params: ['date'],
		/** @type {string} date */
		title: 'date',
	},
'dirigeant . auto-entrepreneur . Cipav . adhérent': {
		/**
		 * Parameters of "dirigeant . auto-entrepreneur . Cipav . adhérent"
		 * @typedef {{
				'dirigeant . auto-entrepreneur . Cipav . adhérent'?: boolean | undefined
			}} Dirigeant___auto_entrepreneur___Cipav___adhérentParams
		 */
		/**
		 * Evaluate "dirigeant . auto-entrepreneur . Cipav . adhérent"
		 * @param {Dirigeant___auto_entrepreneur___Cipav___adhérentParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {boolean | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_dirigeant___auto_entrepreneur___Cipav___adhérent, params, options).value,
		/**
		 * Evaluate "dirigeant . auto-entrepreneur . Cipav . adhérent" with information on missing and needed parameters
		 * @param {Dirigeant___auto_entrepreneur___Cipav___adhérentParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: boolean | undefined | null; needed: Array<keyof Dirigeant___auto_entrepreneur___Cipav___adhérentParams>, missing: Array<keyof Dirigeant___auto_entrepreneur___Cipav___adhérentParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_dirigeant___auto_entrepreneur___Cipav___adhérent, params, options),
		/** @type {"boolean"} */
		type: "boolean",
		/** Parameter list for "dirigeant . auto-entrepreneur . Cipav . adhérent"
		 * @type {Array<keyof Dirigeant___auto_entrepreneur___Cipav___adhérentParams>}
		 */
		params: ['dirigeant . auto-entrepreneur . Cipav . adhérent'],
		/** @type {string} dirigeant . auto-entrepreneur . Cipav . adhérent */
		title: 'dirigeant . auto-entrepreneur . Cipav . adhérent',
		/** @type {string} Depuis le 1er janvier 2018, les auto-entreprises d’activité libérale non
réglementée sont affiliées à la Sécurité sociale pour les indépendants (SSI).

Les auto-entreprises d’activité libérale non réglementée créées avant le 1er
janvier 2018, qui étaient adhérentes à la Cipav, demeurent à la Cipav.

Les auto-entrepreneurs concernés disposent toutefois d’un droit d’option
durant cinq ans afin de rejoindre la Sécurité sociale pour les indépendants
(SSI).
 */
		description: 'Depuis le 1er janvier 2018, les auto-entreprises d’activité libérale non\nréglementée sont affiliées à la Sécurité sociale pour les indépendants (SSI).\n\nLes auto-entreprises d’activité libérale non réglementée créées avant le 1er\njanvier 2018, qui étaient adhérentes à la Cipav, demeurent à la Cipav.\n\nLes auto-entrepreneurs concernés disposent toutefois d’un droit d’option\ndurant cinq ans afin de rejoindre la Sécurité sociale pour les indépendants\n(SSI).\n',
		/** Custom meta of rule "dirigeant . auto-entrepreneur . Cipav . adhérent" */
		meta: {"question":"Êtes-vous adhérent à la Cipav ?","références":{"Qui est assuré à la Cipav ?":"https://www.lacipav.fr/qui-est-assure-cipav"}} /** @type {const} */,
	},
'dirigeant . auto-entrepreneur . cotisations et contributions': {
		/**
		 * Parameters of "dirigeant . auto-entrepreneur . cotisations et contributions"
		 * @typedef {{
				'date'?: Date | undefined;
				'dirigeant . auto-entrepreneur . Cipav . adhérent'?: boolean | undefined;
				'entreprise . activité . nature'?: string | undefined;
				'entreprise . activité . nature . libérale . réglementée'?: boolean | undefined;
				'entreprise . chiffre d'affaires . BIC'?: number | undefined;
				'entreprise . chiffre d'affaires . service BIC'?: number | undefined;
				'entreprise . chiffre d'affaires . service BNC'?: number | undefined;
				'entreprise . chiffre d'affaires . vente restauration hébergement'?: number | undefined;
				'entreprise . date de création'?: Date | undefined;
				'entreprise . durée d'activité'?: number | undefined;
				'entreprise . durée d'activité . années civiles'?: number | undefined;
				'entreprise . durée d'activité . trimestres civils'?: number | undefined;
				'établissement . commune . département . outre-mer'?: boolean | undefined
			}} Dirigeant___auto_entrepreneur___cotisations_et_contributionsParams
		 */
		/**
		 * Evaluate "dirigeant . auto-entrepreneur . cotisations et contributions"
		 * @param {Dirigeant___auto_entrepreneur___cotisations_et_contributionsParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_dirigeant___auto_entrepreneur___cotisations_et_contributions, params, options).value,
		/**
		 * Evaluate "dirigeant . auto-entrepreneur . cotisations et contributions" with information on missing and needed parameters
		 * @param {Dirigeant___auto_entrepreneur___cotisations_et_contributionsParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Dirigeant___auto_entrepreneur___cotisations_et_contributionsParams>, missing: Array<keyof Dirigeant___auto_entrepreneur___cotisations_et_contributionsParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_dirigeant___auto_entrepreneur___cotisations_et_contributions, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"€/an"} */
		unit: "€/an",
		/** Parameter list for "dirigeant . auto-entrepreneur . cotisations et contributions"
		 * @type {Array<keyof Dirigeant___auto_entrepreneur___cotisations_et_contributionsParams>}
		 */
		params: ['date', 'dirigeant . auto-entrepreneur . Cipav . adhérent', 'entreprise . activité . nature', 'entreprise . activité . nature . libérale . réglementée', 'entreprise . chiffre d\'affaires . BIC', 'entreprise . chiffre d\'affaires . service BIC', 'entreprise . chiffre d\'affaires . service BNC', 'entreprise . chiffre d\'affaires . vente restauration hébergement', 'entreprise . date de création', 'entreprise . durée d\'activité', 'entreprise . durée d\'activité . années civiles', 'entreprise . durée d\'activité . trimestres civils', 'établissement . commune . département . outre-mer'],
		/** @type {string} dirigeant . auto-entrepreneur . cotisations et contributions */
		title: 'dirigeant . auto-entrepreneur . cotisations et contributions',
		/** Custom meta of rule "dirigeant . auto-entrepreneur . cotisations et contributions" */
		meta: {"références":{"Imposition du micro-entrepreneur (régime micro-fiscal et social)":"https://www.service-public.fr/professionnels-entreprises/vosdroits/F23267","Les cotisations et contributions sociales":"https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/lessentiel-du-statut.html#cout-durant-vie-auto-entreprise"}} /** @type {const} */,
	},
'dirigeant . auto-entrepreneur . cotisations et contributions . TFC': {
		/**
		 * Parameters of "dirigeant . auto-entrepreneur . cotisations et contributions . TFC"
		 * @typedef {{
				'entreprise . activité . nature'?: string | undefined;
				'entreprise . chiffre d'affaires . service BIC'?: number | undefined;
				'entreprise . chiffre d'affaires . vente restauration hébergement'?: number | undefined
			}} Dirigeant___auto_entrepreneur___cotisations_et_contributions___TFCParams
		 */
		/**
		 * Evaluate "dirigeant . auto-entrepreneur . cotisations et contributions . TFC"
		 * @param {Dirigeant___auto_entrepreneur___cotisations_et_contributions___TFCParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC, params, options).value,
		/**
		 * Evaluate "dirigeant . auto-entrepreneur . cotisations et contributions . TFC" with information on missing and needed parameters
		 * @param {Dirigeant___auto_entrepreneur___cotisations_et_contributions___TFCParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Dirigeant___auto_entrepreneur___cotisations_et_contributions___TFCParams>, missing: Array<keyof Dirigeant___auto_entrepreneur___cotisations_et_contributions___TFCParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_dirigeant___auto_entrepreneur___cotisations_et_contributions___TFC, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"€/an"} */
		unit: "€/an",
		/** Parameter list for "dirigeant . auto-entrepreneur . cotisations et contributions . TFC"
		 * @type {Array<keyof Dirigeant___auto_entrepreneur___cotisations_et_contributions___TFCParams>}
		 */
		params: ['entreprise . activité . nature', 'entreprise . chiffre d\'affaires . service BIC', 'entreprise . chiffre d\'affaires . vente restauration hébergement'],
		/** @type {string} Taxes pour frais de chambre */
		title: 'Taxes pour frais de chambre',
		/** @type {string} Nous n’avons pas intégré les exceptions suivantes :
- Artisans en double immatriculation CCI-CMA
 */
		note: 'Nous n’avons pas intégré les exceptions suivantes :\n- Artisans en double immatriculation CCI-CMA\n',
		/** Custom meta of rule "dirigeant . auto-entrepreneur . cotisations et contributions . TFC" */
		meta: {"références":{"Fiche service-public.fr":"https://www.service-public.fr/professionnels-entreprises/vosdroits/F32847"}} /** @type {const} */,
	},
'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations': {
		/**
		 * Parameters of "dirigeant . auto-entrepreneur . cotisations et contributions . cotisations"
		 * @typedef {{
				'date'?: Date | undefined;
				'dirigeant . auto-entrepreneur . Cipav . adhérent'?: boolean | undefined;
				'entreprise . activité . nature'?: string | undefined;
				'entreprise . activité . nature . libérale . réglementée'?: boolean | undefined;
				'entreprise . chiffre d'affaires . service BIC'?: number | undefined;
				'entreprise . chiffre d'affaires . service BNC'?: number | undefined;
				'entreprise . chiffre d'affaires . vente restauration hébergement'?: number | undefined;
				'entreprise . date de création'?: Date | undefined;
				'entreprise . durée d'activité'?: number | undefined;
				'entreprise . durée d'activité . années civiles'?: number | undefined;
				'entreprise . durée d'activité . trimestres civils'?: number | undefined;
				'établissement . commune . département . outre-mer'?: boolean | undefined
			}} Dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisationsParams
		 */
		/**
		 * Evaluate "dirigeant . auto-entrepreneur . cotisations et contributions . cotisations"
		 * @param {Dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisationsParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations, params, options).value,
		/**
		 * Evaluate "dirigeant . auto-entrepreneur . cotisations et contributions . cotisations" with information on missing and needed parameters
		 * @param {Dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisationsParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisationsParams>, missing: Array<keyof Dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisationsParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisations, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"€/an"} */
		unit: "€/an",
		/** Parameter list for "dirigeant . auto-entrepreneur . cotisations et contributions . cotisations"
		 * @type {Array<keyof Dirigeant___auto_entrepreneur___cotisations_et_contributions___cotisationsParams>}
		 */
		params: ['date', 'dirigeant . auto-entrepreneur . Cipav . adhérent', 'entreprise . activité . nature', 'entreprise . activité . nature . libérale . réglementée', 'entreprise . chiffre d\'affaires . service BIC', 'entreprise . chiffre d\'affaires . service BNC', 'entreprise . chiffre d\'affaires . vente restauration hébergement', 'entreprise . date de création', 'entreprise . durée d\'activité', 'entreprise . durée d\'activité . années civiles', 'entreprise . durée d\'activité . trimestres civils', 'établissement . commune . département . outre-mer'],
		/** @type {string} dirigeant . auto-entrepreneur . cotisations et contributions . cotisations */
		title: 'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
		/** @type {string} Les cotisations sociales donnent à l’auto-entrepreneur accès à une
protection sociale minimale : une retraite, des soins de santé, des
allocations familiales, etc.

L’auto-entreprise est un régime simplifié : plutôt qu’une fiche de paie
complexe, toutes les cotisations sont regroupées dans un *forfait* dont le
taux dépend de la catégorie d’activité.
 */
		description: 'Les cotisations sociales donnent à l’auto-entrepreneur accès à une\nprotection sociale minimale : une retraite, des soins de santé, des\nallocations familiales, etc.\n\nL’auto-entreprise est un régime simplifié : plutôt qu’une fiche de paie\ncomplexe, toutes les cotisations sont regroupées dans un *forfait* dont le\ntaux dépend de la catégorie d’activité.\n',
		/** Custom meta of rule "dirigeant . auto-entrepreneur . cotisations et contributions . cotisations" */
		meta: {"références":{"Les cotisations et contributions sociales":"https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/lessentiel-du-statut.html#cout-durant-vie-auto-entreprise","Cotisations et contributions sociales : montant et déclaration":"https://entreprendre.service-public.fr/vosdroits/F36232#fiche-item-aria-2","Droit à la retraite des travailleurs indépendants relevant du dispositif micro-social":"https://legislation.lassuranceretraite.fr/Pdf/circulaire_cnav_2024_23_16072024.pdf"}} /** @type {const} */,
	},
'dirigeant . auto-entrepreneur . revenu net': {
		/**
		 * Parameters of "dirigeant . auto-entrepreneur . revenu net"
		 * @typedef {{
				'date'?: Date | undefined;
				'dirigeant . auto-entrepreneur . Cipav . adhérent'?: boolean | undefined;
				'entreprise . activité . nature'?: string | undefined;
				'entreprise . activité . nature . libérale . réglementée'?: boolean | undefined;
				'entreprise . chiffre d'affaires . BIC'?: number | undefined;
				'entreprise . chiffre d'affaires . service BIC'?: number | undefined;
				'entreprise . chiffre d'affaires . service BNC'?: number | undefined;
				'entreprise . chiffre d'affaires . vente restauration hébergement'?: number | undefined;
				'entreprise . date de création'?: Date | undefined;
				'entreprise . durée d'activité'?: number | undefined;
				'entreprise . durée d'activité . années civiles'?: number | undefined;
				'entreprise . durée d'activité . trimestres civils'?: number | undefined;
				'établissement . commune . département . outre-mer'?: boolean | undefined
			}} Dirigeant___auto_entrepreneur___revenu_netParams
		 */
		/**
		 * Evaluate "dirigeant . auto-entrepreneur . revenu net"
		 * @param {Dirigeant___auto_entrepreneur___revenu_netParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_dirigeant___auto_entrepreneur___revenu_net, params, options).value,
		/**
		 * Evaluate "dirigeant . auto-entrepreneur . revenu net" with information on missing and needed parameters
		 * @param {Dirigeant___auto_entrepreneur___revenu_netParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Dirigeant___auto_entrepreneur___revenu_netParams>, missing: Array<keyof Dirigeant___auto_entrepreneur___revenu_netParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_dirigeant___auto_entrepreneur___revenu_net, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"€/an"} */
		unit: "€/an",
		/** Parameter list for "dirigeant . auto-entrepreneur . revenu net"
		 * @type {Array<keyof Dirigeant___auto_entrepreneur___revenu_netParams>}
		 */
		params: ['date', 'dirigeant . auto-entrepreneur . Cipav . adhérent', 'entreprise . activité . nature', 'entreprise . activité . nature . libérale . réglementée', 'entreprise . chiffre d\'affaires . BIC', 'entreprise . chiffre d\'affaires . service BIC', 'entreprise . chiffre d\'affaires . service BNC', 'entreprise . chiffre d\'affaires . vente restauration hébergement', 'entreprise . date de création', 'entreprise . durée d\'activité', 'entreprise . durée d\'activité . années civiles', 'entreprise . durée d\'activité . trimestres civils', 'établissement . commune . département . outre-mer'],
		/** @type {string} dirigeant . auto-entrepreneur . revenu net */
		title: 'dirigeant . auto-entrepreneur . revenu net',
		/** @type {string} Il s’agit du revenu après déductions des cotisations, avant le paiement de l’impôt sur le revenu. */
		description: 'Il s’agit du revenu après déductions des cotisations, avant le paiement de l’impôt sur le revenu.',
		/** Custom meta of rule "dirigeant . auto-entrepreneur . revenu net" */
		meta: {"identifiant court":"auto-entrepreneur-net","résumé":"Avant impôt","question":"Quel revenu avant impôt voulez-vous toucher ?"} /** @type {const} */,
	},
'entreprise . activité . nature': {
		/**
		 * Parameters of "entreprise . activité . nature"
		 * @typedef {{
				'entreprise . activité . nature'?: string | undefined
			}} Entreprise___activité___natureParams
		 */
		/**
		 * Evaluate "entreprise . activité . nature"
		 * @param {Entreprise___activité___natureParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {string | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_entreprise___activité___nature, params, options).value,
		/**
		 * Evaluate "entreprise . activité . nature" with information on missing and needed parameters
		 * @param {Entreprise___activité___natureParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: string | undefined | null; needed: Array<keyof Entreprise___activité___natureParams>, missing: Array<keyof Entreprise___activité___natureParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_entreprise___activité___nature, params, options),
		/** @type {"text"} */
		type: "text",
		/** Parameter list for "entreprise . activité . nature"
		 * @type {Array<keyof Entreprise___activité___natureParams>}
		 */
		params: ['entreprise . activité . nature'],
		/** @type {string} entreprise . activité . nature */
		title: 'entreprise . activité . nature',
	},
'entreprise . activité . nature . libérale . réglementée': {
		/**
		 * Parameters of "entreprise . activité . nature . libérale . réglementée"
		 * @typedef {{
				'entreprise . activité . nature . libérale . réglementée'?: boolean | undefined
			}} Entreprise___activité___nature___libérale___réglementéeParams
		 */
		/**
		 * Evaluate "entreprise . activité . nature . libérale . réglementée"
		 * @param {Entreprise___activité___nature___libérale___réglementéeParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {boolean | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_entreprise___activité___nature___libérale___réglementée, params, options).value,
		/**
		 * Evaluate "entreprise . activité . nature . libérale . réglementée" with information on missing and needed parameters
		 * @param {Entreprise___activité___nature___libérale___réglementéeParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: boolean | undefined | null; needed: Array<keyof Entreprise___activité___nature___libérale___réglementéeParams>, missing: Array<keyof Entreprise___activité___nature___libérale___réglementéeParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_entreprise___activité___nature___libérale___réglementée, params, options),
		/** @type {"boolean"} */
		type: "boolean",
		/** Parameter list for "entreprise . activité . nature . libérale . réglementée"
		 * @type {Array<keyof Entreprise___activité___nature___libérale___réglementéeParams>}
		 */
		params: ['entreprise . activité . nature . libérale . réglementée'],
		/** @type {string} entreprise . activité . nature . libérale . réglementée */
		title: 'entreprise . activité . nature . libérale . réglementée',
	},
'entreprise . chiffre d\'affaires': {
		/**
		 * Parameters of "entreprise . chiffre d'affaires"
		 * @typedef {{
				'entreprise . chiffre d'affaires . BIC'?: number | undefined;
				'entreprise . chiffre d'affaires . service BIC'?: number | undefined;
				'entreprise . chiffre d'affaires . service BNC'?: number | undefined;
				'entreprise . chiffre d'affaires . vente restauration hébergement'?: number | undefined
			}} Entreprise___chiffre_d_affairesParams
		 */
		/**
		 * Evaluate "entreprise . chiffre d'affaires"
		 * @param {Entreprise___chiffre_d_affairesParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_entreprise___chiffre_d_affaires, params, options).value,
		/**
		 * Evaluate "entreprise . chiffre d'affaires" with information on missing and needed parameters
		 * @param {Entreprise___chiffre_d_affairesParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Entreprise___chiffre_d_affairesParams>, missing: Array<keyof Entreprise___chiffre_d_affairesParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_entreprise___chiffre_d_affaires, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"€/an"} */
		unit: "€/an",
		/** Parameter list for "entreprise . chiffre d'affaires"
		 * @type {Array<keyof Entreprise___chiffre_d_affairesParams>}
		 */
		params: ['entreprise . chiffre d\'affaires . BIC', 'entreprise . chiffre d\'affaires . service BIC', 'entreprise . chiffre d\'affaires . service BNC', 'entreprise . chiffre d\'affaires . vente restauration hébergement'],
		/** @type {string} entreprise . chiffre d'affaires */
		title: 'entreprise . chiffre d\'affaires',
	},
'entreprise . chiffre d\'affaires . BIC': {
		/**
		 * Parameters of "entreprise . chiffre d'affaires . BIC"
		 * @typedef {{
				'entreprise . chiffre d'affaires . BIC'?: number | undefined
			}} Entreprise___chiffre_d_affaires___BICParams
		 */
		/**
		 * Evaluate "entreprise . chiffre d'affaires . BIC"
		 * @param {Entreprise___chiffre_d_affaires___BICParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_entreprise___chiffre_d_affaires___BIC, params, options).value,
		/**
		 * Evaluate "entreprise . chiffre d'affaires . BIC" with information on missing and needed parameters
		 * @param {Entreprise___chiffre_d_affaires___BICParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Entreprise___chiffre_d_affaires___BICParams>, missing: Array<keyof Entreprise___chiffre_d_affaires___BICParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_entreprise___chiffre_d_affaires___BIC, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"€/an"} */
		unit: "€/an",
		/** Parameter list for "entreprise . chiffre d'affaires . BIC"
		 * @type {Array<keyof Entreprise___chiffre_d_affaires___BICParams>}
		 */
		params: ['entreprise . chiffre d\'affaires . BIC'],
		/** @type {string} entreprise . chiffre d'affaires . BIC */
		title: 'entreprise . chiffre d\'affaires . BIC',
	},
'entreprise . chiffre d\'affaires . service BIC': {
		/**
		 * Parameters of "entreprise . chiffre d'affaires . service BIC"
		 * @typedef {{
				'entreprise . chiffre d'affaires . service BIC'?: number | undefined
			}} Entreprise___chiffre_d_affaires___service_BICParams
		 */
		/**
		 * Evaluate "entreprise . chiffre d'affaires . service BIC"
		 * @param {Entreprise___chiffre_d_affaires___service_BICParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_entreprise___chiffre_d_affaires___service_BIC, params, options).value,
		/**
		 * Evaluate "entreprise . chiffre d'affaires . service BIC" with information on missing and needed parameters
		 * @param {Entreprise___chiffre_d_affaires___service_BICParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Entreprise___chiffre_d_affaires___service_BICParams>, missing: Array<keyof Entreprise___chiffre_d_affaires___service_BICParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_entreprise___chiffre_d_affaires___service_BIC, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"€/an"} */
		unit: "€/an",
		/** Parameter list for "entreprise . chiffre d'affaires . service BIC"
		 * @type {Array<keyof Entreprise___chiffre_d_affaires___service_BICParams>}
		 */
		params: ['entreprise . chiffre d\'affaires . service BIC'],
		/** @type {string} entreprise . chiffre d'affaires . service BIC */
		title: 'entreprise . chiffre d\'affaires . service BIC',
	},
'entreprise . chiffre d\'affaires . service BNC': {
		/**
		 * Parameters of "entreprise . chiffre d'affaires . service BNC"
		 * @typedef {{
				'entreprise . chiffre d'affaires . service BNC'?: number | undefined
			}} Entreprise___chiffre_d_affaires___service_BNCParams
		 */
		/**
		 * Evaluate "entreprise . chiffre d'affaires . service BNC"
		 * @param {Entreprise___chiffre_d_affaires___service_BNCParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_entreprise___chiffre_d_affaires___service_BNC, params, options).value,
		/**
		 * Evaluate "entreprise . chiffre d'affaires . service BNC" with information on missing and needed parameters
		 * @param {Entreprise___chiffre_d_affaires___service_BNCParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Entreprise___chiffre_d_affaires___service_BNCParams>, missing: Array<keyof Entreprise___chiffre_d_affaires___service_BNCParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_entreprise___chiffre_d_affaires___service_BNC, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"€/an"} */
		unit: "€/an",
		/** Parameter list for "entreprise . chiffre d'affaires . service BNC"
		 * @type {Array<keyof Entreprise___chiffre_d_affaires___service_BNCParams>}
		 */
		params: ['entreprise . chiffre d\'affaires . service BNC'],
		/** @type {string} entreprise . chiffre d'affaires . service BNC */
		title: 'entreprise . chiffre d\'affaires . service BNC',
	},
'entreprise . chiffre d\'affaires . vente restauration hébergement': {
		/**
		 * Parameters of "entreprise . chiffre d'affaires . vente restauration hébergement"
		 * @typedef {{
				'entreprise . chiffre d'affaires . vente restauration hébergement'?: number | undefined
			}} Entreprise___chiffre_d_affaires___vente_restauration_hébergementParams
		 */
		/**
		 * Evaluate "entreprise . chiffre d'affaires . vente restauration hébergement"
		 * @param {Entreprise___chiffre_d_affaires___vente_restauration_hébergementParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_entreprise___chiffre_d_affaires___vente_restauration_hébergement, params, options).value,
		/**
		 * Evaluate "entreprise . chiffre d'affaires . vente restauration hébergement" with information on missing and needed parameters
		 * @param {Entreprise___chiffre_d_affaires___vente_restauration_hébergementParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Entreprise___chiffre_d_affaires___vente_restauration_hébergementParams>, missing: Array<keyof Entreprise___chiffre_d_affaires___vente_restauration_hébergementParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_entreprise___chiffre_d_affaires___vente_restauration_hébergement, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"€/an"} */
		unit: "€/an",
		/** Parameter list for "entreprise . chiffre d'affaires . vente restauration hébergement"
		 * @type {Array<keyof Entreprise___chiffre_d_affaires___vente_restauration_hébergementParams>}
		 */
		params: ['entreprise . chiffre d\'affaires . vente restauration hébergement'],
		/** @type {string} entreprise . chiffre d'affaires . vente restauration hébergement */
		title: 'entreprise . chiffre d\'affaires . vente restauration hébergement',
	},
'entreprise . date de création': {
		/**
		 * Parameters of "entreprise . date de création"
		 * @typedef {{
				'entreprise . date de création'?: Date | undefined
			}} Entreprise___date_de_créationParams
		 */
		/**
		 * Evaluate "entreprise . date de création"
		 * @param {Entreprise___date_de_créationParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {Date | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_entreprise___date_de_création, params, options).value,
		/**
		 * Evaluate "entreprise . date de création" with information on missing and needed parameters
		 * @param {Entreprise___date_de_créationParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: Date | undefined | null; needed: Array<keyof Entreprise___date_de_créationParams>, missing: Array<keyof Entreprise___date_de_créationParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_entreprise___date_de_création, params, options),
		/** @type {"date"} */
		type: "date",
		/** Parameter list for "entreprise . date de création"
		 * @type {Array<keyof Entreprise___date_de_créationParams>}
		 */
		params: ['entreprise . date de création'],
		/** @type {string} entreprise . date de création */
		title: 'entreprise . date de création',
	},
'entreprise . durée d\'activité': {
		/**
		 * Parameters of "entreprise . durée d'activité"
		 * @typedef {{
				'entreprise . durée d'activité'?: number | undefined
			}} Entreprise___durée_d_activitéParams
		 */
		/**
		 * Evaluate "entreprise . durée d'activité"
		 * @param {Entreprise___durée_d_activitéParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_entreprise___durée_d_activité, params, options).value,
		/**
		 * Evaluate "entreprise . durée d'activité" with information on missing and needed parameters
		 * @param {Entreprise___durée_d_activitéParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Entreprise___durée_d_activitéParams>, missing: Array<keyof Entreprise___durée_d_activitéParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_entreprise___durée_d_activité, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"an"} */
		unit: "an",
		/** Parameter list for "entreprise . durée d'activité"
		 * @type {Array<keyof Entreprise___durée_d_activitéParams>}
		 */
		params: ['entreprise . durée d\'activité'],
		/** @type {string} entreprise . durée d'activité */
		title: 'entreprise . durée d\'activité',
	},
'entreprise . durée d\'activité . années civiles': {
		/**
		 * Parameters of "entreprise . durée d'activité . années civiles"
		 * @typedef {{
				'entreprise . durée d'activité . années civiles'?: number | undefined
			}} Entreprise___durée_d_activité___années_civilesParams
		 */
		/**
		 * Evaluate "entreprise . durée d'activité . années civiles"
		 * @param {Entreprise___durée_d_activité___années_civilesParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_entreprise___durée_d_activité___années_civiles, params, options).value,
		/**
		 * Evaluate "entreprise . durée d'activité . années civiles" with information on missing and needed parameters
		 * @param {Entreprise___durée_d_activité___années_civilesParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Entreprise___durée_d_activité___années_civilesParams>, missing: Array<keyof Entreprise___durée_d_activité___années_civilesParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_entreprise___durée_d_activité___années_civiles, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"aucune"} */
		unit: "aucune",
		/** Parameter list for "entreprise . durée d'activité . années civiles"
		 * @type {Array<keyof Entreprise___durée_d_activité___années_civilesParams>}
		 */
		params: ['entreprise . durée d\'activité . années civiles'],
		/** @type {string} entreprise . durée d'activité . années civiles */
		title: 'entreprise . durée d\'activité . années civiles',
	},
'entreprise . durée d\'activité . trimestres civils': {
		/**
		 * Parameters of "entreprise . durée d'activité . trimestres civils"
		 * @typedef {{
				'entreprise . durée d'activité . trimestres civils'?: number | undefined
			}} Entreprise___durée_d_activité___trimestres_civilsParams
		 */
		/**
		 * Evaluate "entreprise . durée d'activité . trimestres civils"
		 * @param {Entreprise___durée_d_activité___trimestres_civilsParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {number | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_entreprise___durée_d_activité___trimestres_civils, params, options).value,
		/**
		 * Evaluate "entreprise . durée d'activité . trimestres civils" with information on missing and needed parameters
		 * @param {Entreprise___durée_d_activité___trimestres_civilsParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: number | undefined | null; needed: Array<keyof Entreprise___durée_d_activité___trimestres_civilsParams>, missing: Array<keyof Entreprise___durée_d_activité___trimestres_civilsParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_entreprise___durée_d_activité___trimestres_civils, params, options),
		/** @type {"number"} */
		type: "number",
		/** @type {"aucune"} */
		unit: "aucune",
		/** Parameter list for "entreprise . durée d'activité . trimestres civils"
		 * @type {Array<keyof Entreprise___durée_d_activité___trimestres_civilsParams>}
		 */
		params: ['entreprise . durée d\'activité . trimestres civils'],
		/** @type {string} entreprise . durée d'activité . trimestres civils */
		title: 'entreprise . durée d\'activité . trimestres civils',
	},
'établissement . commune . département . outre-mer': {
		/**
		 * Parameters of "établissement . commune . département . outre-mer"
		 * @typedef {{
				'établissement . commune . département . outre-mer'?: boolean | undefined
			}} établissement___commune___département___outre_merParams
		 */
		/**
		 * Evaluate "établissement . commune . département . outre-mer"
		 * @param {établissement___commune___département___outre_merParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {boolean | undefined | null}
		 */
		evaluate: (params = {}, options) => $evaluate(_établissement___commune___département___outre_mer, params, options).value,
		/**
		 * Evaluate "établissement . commune . département . outre-mer" with information on missing and needed parameters
		 * @param {établissement___commune___département___outre_merParams} [params={}]
		 * @param {Object} [options={}]
		 * @param {boolean} [option.cache=false]
		 * @return {{value: boolean | undefined | null; needed: Array<keyof établissement___commune___département___outre_merParams>, missing: Array<keyof établissement___commune___département___outre_merParams> }}
		 */
		evaluateParams: (params = {}, options) => $evaluate(_établissement___commune___département___outre_mer, params, options),
		/** @type {"boolean"} */
		type: "boolean",
		/** Parameter list for "établissement . commune . département . outre-mer"
		 * @type {Array<keyof établissement___commune___département___outre_merParams>}
		 */
		params: ['établissement . commune . département . outre-mer'],
		/** @type {string} établissement . commune . département . outre-mer */
		title: 'établissement . commune . département . outre-mer',
	}
}

export default rules;