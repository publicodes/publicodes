import { BinaryOp, Computation } from './types'

class RuntimeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RuntimeError'
  }
}

type Value = {
  v: number | string | boolean | null | undefined | Date
  p: Array<string>
}

export function evaluateNode(
  evalTree: readonly Computation[],
  c: Computation,
  context: unknown = {},
): Value {
  if (c === null) return { v: null, p: [] }
  if (
    c === null ||
    typeof c === 'boolean' ||
    typeof c === 'number' ||
    typeof c === 'string'
  ) {
    return { v: c, p: [] }
  }

  if (Array.isArray(c)) {
    if (c.length === 0) {
      return { v: undefined, p: [] }
    }

    // -----------------------------
    // Unary operators
    // -----------------------------

    if (c.length === 2) {
      const val = evaluateNode(evalTree, evalTree[c[1]], context)
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
      const left = evaluateNode(evalTree, evalTree[c[1]], context)

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
      const right = evaluateNode(evalTree, evalTree[c[2]], context)
      if (left.v === undefined) {
        if (right.v === 0 && op === '*') return { v: 0, p: right.p }
        if (right.v === 0 && op === '**') return { v: 1, p: right.p }
        if (right.v === 0 && op === '/')
          throw new RuntimeError('Division by zero')
        if (right.v === false && op === '&&') return { v: false, p: right.p }
        if (right.v === true && op === '||') return { v: true, p: right.p }
        return {
          v: undefined,
          p: left.p.concat(right.p),
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
      } else {
        throw new RuntimeError('Internal error : Invalid operation')
      }
      return {
        v,
        p: left.p.concat(right.p),
      }
    }

    // -----------------------------
    // Conditional (ternary)
    // -----------------------------
    if (c.length === 3) {
      const condition = evaluateNode(evalTree, evalTree[c[0]], context)

      if (condition.v === null || condition.v === undefined) {
        return condition
      }

      const val = evaluateNode(
        evalTree,
        condition.v ? evalTree[c[1]] : evalTree[c[2]],
        context,
      )

      return {
        v: val.v,
        p: condition.p.concat(val.p),
      }
    }
  }

  // -----------------------------
  // Date
  // -----------------------------
  if ('date' in c) {
    return { v: new Date(c.date).valueOf(), p: [] }
  }
  // -----------------------------
  // Get context
  // -----------------------------
  if ('get' in c) {
    return { v: context[c.get], p: [c.get] }
  }
  // -----------------------------
  // Set context
  // -----------------------------
  if ('context' in c) {
    const newContext = { ...context }
    const neededParameters = []
    for (const rule in c.context) {
      const val = evaluateNode(evalTree, evalTree[c.context[rule]], context)
      newContext[rule] = val.v
      neededParameters.push(...val.p)
    }
    const value = evaluateNode(evalTree, evalTree[c.value], newContext)
    // Remove neededParameters that are set in the context
    value.p = value.p.filter((param) => !(param in c.context))
    value.p.push(...neededParameters)
    return value
  }
  throw new RuntimeError('Internal error : Invalid computation')
}

const LazyNullOps: BinaryOp[] = ['*', '/', '**', '<', '<=', '>', '>=']
