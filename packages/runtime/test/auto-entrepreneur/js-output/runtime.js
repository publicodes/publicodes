/**
 * @typedef {() => number | undefined | null} LazyNumber
 * @typedef {() => date | number | string | undefined | null} LazyComparable
 */

/**
 * TODO:
 * - Test with an eager value for the left operand.
 * - How to provide better information about the error (eg. rule name,
 *   operation, etc...)?
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
 * @param {number | null | undefined} value
 * @returns {boolean}
 */
function isZero(value) {
	return value === 0 || value === null
}

/**
 * @param {LazyNumber} left
 * @param {LazyNumber} right
 * @returns {number | undefined}
 *
 * @specification
 * The addition operation is defined as follows by order of precedence:
 * 1. ∀ x. add(undefined, x) = add(x, undefined) = undefined
 * 2. ∀ x. add(x, null) = add(null, x) = x
 * 3. ∀ x, y. add(x, y) = x + y
 */
function add(left, right) {
	const l = left()
	if (l === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return l ?? 0 + r ?? 0
}

/**
 * @param {LazyNumber} left
 * @param {LazyNumber} right
 * @returns {number | undefined}
 *
 * @specification
 * The subtraction operation is defined as follows by order of precedence:
 * 1. ∀ x. sub(undefined, x) = sub(x, undefined) = undefined
 * 2. ∀ x. sub(x, null) = x
 * 3. ∀ x. sub(null, x) = -x
 * 4. ∀ x, y. sub(x, y) = x - y
 */
function sub(left, right) {
	const l = left()
	if (l === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return l ?? 0 - r ?? 0
}

/**
 * @param {LazyNumber} left
 * @param {LazyNumber} right
 * @returns {number | undefined}
 *
 * @specification
 * The multiplication operation is defined as follows by order of precedence:
 * 1. ∀ x. mul(0, x) = mul(x, 0) = 0
 * 2. ∀ x. mul(null, x) = mul(x, null) = null
 * 3. ∀ x. mul(undefined, x) = mul(x, undefined) = undefined
 *
 * TODO: how to define the precedence over the null and zero values?
 */
function mul(left, right) {
	const l = left()
	if (l === null || l === 0) {
		return l
	}

	const r = right()
	if (l === undefined) {
		return isZero(r) ? 0 : undefined
	}

	return r === undefined ? undefined : (l * r ?? 0)
}

/**
 * @param {LazyNumber} left
 * @param {LazyNumber} right
 * @returns {number | undefined}
 *
 * @throws {RuntimeError} if the right operand is evaluated to zero.
 *
 * @specification
 * The division operation is defined as follows by order of precedence:
 * 1. ∀ x. div(0, x) = 0
 * 1. ∀ x. div(null, x) = null
 * 1. ∀ x. div(x, 0) = div(x, null) = throw RuntimeError('Division by zero')
 * 2. ∀ x. div(undefined, x) = div(x, undefined) = undefined
 * 3. ∀ x, y. div(x, y) = x / y
 */
function div(left, right) {
	const l = left()
	if (isZero(l)) {
		return 0
	}

	const r = right()
	if (l === undefined) {
		if (isZero(r)) {
			// TODO: improve information provided in the error
			throw new RuntimeError('Division by zero')
		}
		return undefined
	}

	return r === undefined ? undefined : (l / r ?? 0)
}

/**
 * @param {LazyNumber} left
 * @param {LazyNumber} right
 * @returns {number | undefined}
 *
 * @specification
 * The power operation is defined as follows by order of precedence:
 * 1. ∀ x. pow(0, y) = pow(null, y) = 0
 * 2. ∀ x. pow(x, 0) = pow(x, null) = 1
 * 3. ∀ x. pow(undefined, y) = pow(x, undefined) = undefined
 * 4. ∀ x, y. pow(x, y) = x ** y
 */
function pow(left, right) {
	const l = left()
	if (isZero(l)) {
		return 0
	}

	const r = right()
	if (l === undefined) {
		return isZero(r) ? 1 : undefined
	}

	return r === undefined ? undefined : (l ** r ?? 0)
}

/** Basic boolean operations */

/**
 * @param {LazyComparable} left
 * @param {LazyComparable} right
 * @returns {boolean | undefined}
 *
 * @specification
 * The equality operation is defined as follows by order of precedence:
 * 1. ∀ x. eq(undefined, x) = eq(x, undefined) = undefined
 * 2. ∀ x, y. eq(x, y) = x === y
 */
function eq(left, right) {
	const l = left()
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
 * @param {LazyComparable} left
 * @param {LazyComparable} right
 * @returns {boolean | undefined}
 *
 * @specification
 * The inequality operation is defined as follows by order of precedence:
 * 1. ∀ x. neq(undefined, x) = neq(x, undefined) = undefined
 * 2. ∀ x, y. neq(x, y) = x !== y
 */
function neq(left, right) {
	const l = left()
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
 * @param {LazyComparable} left
 * @param {LazyComparable} right
 * @returns {boolean | undefined}
 *
 * @specification
 * The less than operation is defined as follows by order of precedence:
 * 1. ∀ x. lt(undefined, x) = lt(x, undefined) = undefined
 * 1. ∀ x. lt(null, x) = lt(x, null) = undefined
 * 2. ∀ x, y. lt(x, y) = x < y
 */
function lt(left, right) {
	const l = left()
	if (l === undefined) {
		return undefined
	}

	const r = right()
	if (r === undefined) {
		return undefined
	}

	return l < r
}
