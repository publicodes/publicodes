import { BinaryOp, Computation } from './types'

class RuntimeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RuntimeError'
  }
}
// Use 15 precision for floating number in JS https://stackoverflow.com/a/3644302
const MAX_FLOAT_PRECISION = 15

export type Value = {
  v: number | string | boolean | null | undefined | Date
  p: Record<string, true>
}

export type Context = Record<string, number | null | undefined | string>

function evaluateNode(
  evalTree: readonly Computation[],
  i: number,
  context: Context,
): Value {
  const c = evalTree[i]
  if (c === null) return { v: null, p: {} }
  if (
    c === null ||
    typeof c === 'boolean' ||
    typeof c === 'number' ||
    typeof c === 'string'
  ) {
    return { v: c, p: {} }
  }

  if (Array.isArray(c)) {
    if (c.length === 0) {
      return { v: undefined, p: {} }
    }

    // -----------------------------
    // Unary operators
    // -----------------------------

    if (c.length === 2) {
      const val = evaluateNode(evalTree, c[1], context)
      const op = c[0]
      if (op === '∅') {
        return {
          v: val.v === undefined,
          p: val.p,
        }
      }
      if (op === '-') {
        if (typeof val.v !== 'number') return val
        return { v: -val.v, p: val.p }
      }
    }

    // -----------------------------
    // Binary operators
    // -----------------------------

    if (c.length === 3 && typeof c[0] === 'string') {
      const op = c[0]
      const left = evaluateNode(evalTree, c[1], context)

      // TODO : should be lazy only if no missings in the computed value ?

      // LAZY (First operand)
      if (left.v === null && LazyNullOps.includes(op)) {
        return left
      }
      if (left.v === 0 && (op === '*' || op === '/' || op === '**')) {
        return left
      }
      if ((left.v === false || left.v === null) && op === '&&') {
        return { v: false, p: left.p }
      }
      if (left.v === true && op === '||') {
        return left
      }

      // LAZY (Second operand)
      const right = evaluateNode(evalTree, c[2], context)
      if (left.v === undefined) {
        if (right.v === 0 && op === '*') return { v: 0, p: right.p }
        if (right.v === 0 && op === '**') return { v: 1, p: right.p }
        if (right.v === 0 && op === '/')
          throw new RuntimeError('Division by zero')
        if (right.v === false && op === '&&') return { v: false, p: right.p }
        if (right.v === true && op === '||') return { v: true, p: right.p }
        return {
          v: undefined,
          p: { ...left.p, ...right.p },
        }
      }

      let v
      if (right.v === undefined) {
        v = undefined
      } else if (op === '+') {
        v = left.v + right.v
      } else if (op === '-') {
        v = left.v - right.v
      } else if (op === '*') {
        v = left.v * right.v
      } else if (op === '/') {
        v = left.v / right.v
      } else if (op === '**') {
        v = left.v ** right.v
      } else if (op === '!=') {
        v = left.v !== right.v
      } else if (op === '<') {
        v = left.v < right.v
      } else if (op === '<=') {
        v = left.v <= right.v
      } else if (op === '>') {
        v = left.v > right.v
      } else if (op === '>=') {
        v = left.v >= right.v
      } else if (op === '=') {
        v = left.v === right.v
      } else if (op === '&&') {
        v = left.v && right.v
      } else if (op === '||') {
        v = left.v || right.v
      } else if (op === 'max' || op === 'min') {
        if (left.v === null) {
          v = right.v
        } else if (right.v === null) {
          v = left.v
        } else {
          v =
            op === 'max' ? Math.max(left.v, right.v) : Math.min(left.v, right.v)
        }
      } else {
        throw new RuntimeError('Internal error : Invalid operation')
      }
      return {
        v,
        p: { ...left.p, ...right.p },
      }
    }

    // -----------------------------
    // Conditional (ternary)
    // -----------------------------
    if (c.length === 3) {
      const condition = evaluateNode(evalTree, c[0], context)

      if (condition.v === null || condition.v === undefined) {
        return condition
      }

      const val = evaluateNode(evalTree, condition.v ? c[1] : c[2], context)

      return {
        v: val.v,
        p: { ...condition.p, ...val.p },
      }
    }

    // -----------------------------
    // Rounding
    // -----------------------------
    if (c.length === 4 && c[0] === 'round') {
      const val = evaluateNode(evalTree, c[3], context)
      if (val.v === null || val.v === undefined) {
        return val
      }
      const precision = evaluateNode(evalTree, c[2], context)
      const p = { ...val.p, ...precision.p }

      if (precision.v === undefined) {
        return { v: undefined, p }
      }
      if (precision.v === null) {
        return { v: val.v, p }
      }
      if (precision.v === 0) {
        throw new RuntimeError('Rounding error: precision cannot be 0')
      }

      const r = (num: number) => +num.toPrecision(MAX_FLOAT_PRECISION)
      const v = r(
        c[1] === 'up' ? Math.ceil(r(val.v / precision.v)) * precision.v
        : c[1] === 'down' ? Math.floor(r(val.v / precision.v)) * precision.v
        : Math.round(r(val.v / precision.v)) * precision.v,
      )

      return {
        v,
        p,
      }
    }
  }

  // -----------------------------
  // Date
  // -----------------------------
  if ('date' in c) {
    return { v: new Date(c.date).valueOf(), p: {} }
  }
  // -----------------------------
  // Get context
  // -----------------------------
  if ('get' in c) {
    return { v: context[c.get], p: { [c.get]: true } }
  }
  // -----------------------------
  // Set context
  // -----------------------------
  if ('context' in c) {
    const newContext = { ...context }
    const neededParameters: Record<string, true> = {}
    for (const rule in c.context) {
      const val = evaluateNode(evalTree, c.context[rule], context)
      newContext[rule] = val.v
      Object.assign(neededParameters, val.p)
    }
    const value = evaluateNode(evalTree, c.value, newContext)
    // Remove neededParameters that are set in the context
    for (const param in c.context) {
      delete value.p[param]
    }
    Object.assign(value.p, neededParameters)
    return value
  }
  throw new RuntimeError('Internal error : Invalid computation')
}

const LazyNullOps: BinaryOp[] = ['*', '/', '**', '<', '<=', '>', '>=']

export default evaluateNode
