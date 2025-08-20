import { BinaryOp, Computation } from './types'

class RuntimeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RuntimeError'
  }
}

export type Value = {
  v: number | string | boolean | null | undefined | Date
  p: Record<string, true>
}

export type Context = Record<string, number | null | undefined | string>

function evaluateNode(
  evalTree: readonly Computation[],
  i: number,
  context: Context,
): Value['v'] {
  const c = evalTree[i]

  if (
    c === null ||
    typeof c === 'boolean' ||
    typeof c === 'number' ||
    typeof c === 'string'
  ) {
    return c
    // { v: c, p: {} }
  }

  if (Array.isArray(c)) {
    if (c.length === 0) {
      return undefined
    }

    // -----------------------------
    // Unary operators
    // -----------------------------

    if (c.length === 2) {
      const val = evaluateNode(evalTree, c[1], context)
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
      const left = evaluateNode(evalTree, c[1], context)

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
        return left
      }

      // LAZY (Second operand)
      const right = evaluateNode(evalTree, c[2], context)
      if (left === undefined) {
        if (right === 0 && op === '*') return { v: 0, p: right.p }
        if (right === 0 && op === '**') return { v: 1, p: right.p }
        if (right === 0 && op === '/')
          throw new RuntimeError('Division by zero')
        if (right === false && op === '&&') return { v: false, p: right.p }
        if (right === true && op === '||') return { v: true, p: right.p }
        return undefined
      }

      let v
      if (right === undefined) {
        v = undefined
      } else if (op === '+') {
        v = left + right
      } else if (op === '-') {
        v = left - right
      } else if (op === '*') {
        v = left * right
      } else if (op === '/') {
        v = left / right
      } else if (op === '**') {
        v = left ** right
      } else if (op === '!=') {
        v = left !== right
      } else if (op === '<') {
        v = left < right
      } else if (op === '<=') {
        v = left <= right
      } else if (op === '>') {
        v = left > right
      } else if (op === '>=') {
        v = left >= right
      } else if (op === '=') {
        v = left === right
      } else if (op === '&&') {
        v = left && right
      } else if (op === '||') {
        v = left || right
      } else {
        throw new RuntimeError('Internal error : Invalid operation')
      }
      return v
    }

    // -----------------------------
    // Conditional (ternary)
    // -----------------------------
    if (c.length === 3) {
      const condition = evaluateNode(evalTree, c[0], context)

      if (condition === null || condition === undefined) {
        return condition
      }

      const val = evaluateNode(evalTree, condition ? c[1] : c[2], context)

      return val
    }
  }

  // -----------------------------
  // Date
  // -----------------------------
  if ('date' in c) {
    return new Date(c.date)
  }
  // -----------------------------
  // Get context
  // -----------------------------
  if ('get' in c) {
    return context[c.get]
  }
  // -----------------------------
  // Set context
  // -----------------------------
  if ('context' in c) {
    const newContext = { ...context }
    for (const rule in c.context) {
      const val = evaluateNode(evalTree, c.context[rule], context)
      newContext[rule] = val
    }
    const value = evaluateNode(evalTree, c.value, newContext)
    // Remove neededParameters that are set in the context

    return value
  }
  throw new RuntimeError('Internal error : Invalid computation')
}

const LazyNullOps: BinaryOp[] = ['*', '/', '**', '<', '<=', '>', '>=']

export default evaluateNode
