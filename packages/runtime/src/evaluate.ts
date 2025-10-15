import { BinaryOp, Computation } from './types'

class RuntimeError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'RuntimeError'
	}
}
// Use 15 precision for floating number in JS https://stackoverflow.com/a/3644302
const MAX_FLOAT_PRECISION = 15

export type Value = number | string | boolean | null | undefined

export type Context = Record<
	string,
	number | null | undefined | string | boolean
> & { _global: Record<string, number | null | undefined | string | boolean> }

function get(context: Context, rule: string, params: string[]): Value {
	if (rule in context) {
		return context[rule]
	}

	params.push(rule)
	return context._global[rule]
}

function evaluateNode(
	evalTree: readonly Computation[],
	i: number,
	context: Context,
	params: string[],
): Value {
	const c = evalTree[i]

	if (c === null) {
		return null
	}

	if (
		// FIXME: why?
		// c === null ||
		typeof c === 'boolean' ||
		typeof c === 'number' ||
		typeof c === 'string'
	) {
		return c
	}

	if (Array.isArray(c)) {
		if (c.length === 0) {
			return undefined
		}

		// -----------------------------
		// Unary operators
		// -----------------------------

		if (c.length === 2) {
			const val = evaluateNode(evalTree, c[1], context, params)
			const op = c[0]

			if (op === '∅') {
				return val === undefined
			}
			if (op === '-') {
				if (typeof val !== 'number') return val
				return -val
			}
		}

		// -----------------------------
		// Binary operators
		// -----------------------------

		if (c.length === 3 && typeof c[0] === 'string') {
			const op = c[0]
			const left = evaluateNode(evalTree, c[1], context, params)

			// TODO : should be lazy only if no missings in the computed value ?

			// LAZY (First operand)
			if (left === null && LazyNullOps.includes(op)) {
				return left
			}
			if (left === 0 && (op === '*' || op === '/' || op === '**')) {
				return left
			}
			if ((left === false || left === null) && op === '&&') {
				return false
			}
			if (left === true && op === '||') {
				return true
			}

			// LAZY (Second operand)
			const right = evaluateNode(evalTree, c[2], context, params)
			if (left === undefined) {
				if (right === 0 && op === '*') return 0
				if (right === 0 && op === '**') return 1
				if (right === 0 && op === '/')
					throw new RuntimeError('Division by zero')
				if (right === false && op === '&&') return false
				if (right === true && op === '||') return true

				return undefined
			}

			let v
			const leftv = left as number
			const rightv = right as number
			if (right === undefined) {
				v = undefined
			} else if (op === '+') {
				v = leftv + rightv
			} else if (op === '-') {
				v = leftv - rightv
			} else if (op === '*') {
				v = leftv * rightv
			} else if (op === '/') {
				v = leftv / rightv
			} else if (op === '**') {
				v = leftv ** rightv
			} else if (op === '!=') {
				v = leftv !== rightv
			} else if (op === '<') {
				v = leftv < rightv
			} else if (op === '<=') {
				v = leftv <= rightv
			} else if (op === '>') {
				v = leftv > rightv
			} else if (op === '>=') {
				v = leftv >= rightv
			} else if (op === '=') {
				v = leftv === rightv
			} else if (op === '&&') {
				v = leftv && rightv
			} else if (op === '||') {
				v = leftv || rightv
			} else if (op === 'max' || op === 'min') {
				if (leftv === null) {
					v = rightv
				} else if (rightv === null) {
					v = leftv
				} else {
					v = op === 'max' ? Math.max(leftv, rightv) : Math.min(leftv, rightv)
				}
			} else {
				throw new RuntimeError('Internal error : Invalid operation')
			}

			return v
		}

		// -----------------------------
		// Conditional (ternary)
		// -----------------------------
		if (c.length === 3) {
			const condition = evaluateNode(evalTree, c[0], context, params)

			if (condition === null || condition === undefined) {
				return condition
			}

			return evaluateNode(evalTree, condition ? c[1] : c[2], context, params)
		}

		// -----------------------------
		// Rounding
		// -----------------------------
		if (c.length === 4 && c[0] === 'round') {
			const val = evaluateNode(evalTree, c[3], context, params)
			if (val === null || val === undefined) {
				return val
			}
			const precision = evaluateNode(evalTree, c[2], context, params)
			if (precision === undefined) {
				return undefined
			}
			if (precision === null) {
				return val
			}

			if (precision === 0) {
				throw new RuntimeError('Rounding error: precision cannot be 0')
			}

			const r = (num: number) => +num.toPrecision(MAX_FLOAT_PRECISION)
			const valv = val as number
			const precv = precision as number
			const v = r(
				c[1] === 'up' ? Math.ceil(r(valv / precv)) * precv
				: c[1] === 'down' ? Math.floor(r(valv / precv)) * precv
				: Math.round(r(valv / precv)) * precv,
			)

			return v
		}
	}

	// -----------------------------
	// Date
	// -----------------------------
	if ('date' in c) {
		return new Date(c.date).valueOf()
	}

	// -----------------------------
	// Ref
	// -----------------------------
	if ('ref' in c) {
		if (c.ref in context || c.ref in context._global) {
			return get(context, c.ref, params)
		} else {
			return evaluateNode(evalTree, c.node, context, params)
		}
	}

	// -----------------------------
	// Get context
	// -----------------------------
	if ('get' in c) {
		return get(context, c.get, params)
	}

	// -----------------------------
	// Set context
	// -----------------------------
	if ('context' in c) {
		const newContext = { ...context }

		for (const rule in c.context) {
			if (rule !== '_global') {
				newContext[rule] = evaluateNode(
					evalTree,
					c.context[rule],
					context,
					params,
				)
			}
		}

		return evaluateNode(evalTree, c.value, newContext, params)
	}
	throw new RuntimeError('Internal error : Invalid computation')
}

const LazyNullOps: BinaryOp[] = ['*', '/', '**', '<', '<=', '>', '>=']

export default evaluateNode
