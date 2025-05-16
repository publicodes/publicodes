import { BinaryOp, EvaluationTree, Computation, Value } from './types'

class RuntimeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RuntimeError'
  }
}

export function evaluateNode(
  evalTree: EvaluationTree,
  value: Computation,
  context: unknown = {},
): Value {
  if (typeof value === 'string')
    // -----------------------------
    // Reference
    // -----------------------------
    return evaluateNode(evalTree, evalTree[value], context)

  if (value === null) return null
  if (typeof value === 'boolean') return value

  if (!('length' in value)) {
    // -----------------------------
    // Conditional (ternary)
    // -----------------------------

    if ('if' in value) {
      const condition = evaluateNode(evalTree, value.if, context)

      if (condition === null) {
        return null
      } else if (condition === undefined) {
        evaluateNode(evalTree, value.then, context)
        evaluateNode(evalTree, value.else, context)
        return
      } else if (condition === true) {
        return evaluateNode(evalTree, value.then, context)
      } else {
        // (condition === false)
        return evaluateNode(evalTree, value.else, context)
      }
    }

    // -----------------------------
    // Date
    // -----------------------------
    if ('d' in value) {
      return new Date(value.d).valueOf()
    }
    // -----------------------------
    // Get context
    // -----------------------------
    if ('get' in value) {
      return context[value.get]
    }
    // -----------------------------
    // Set context
    // -----------------------------
    if ('context' in value) {
      const newContext = { ...context }
      for (const rule in value.context) {
        newContext[rule] = evaluateNode(evalTree, value.context[rule], context)
      }
      return evaluateNode(evalTree, value.value, newContext)
    }
  }
  if (value.length === 0) return undefined

  if (value.length === 1) return value[0]

  // -----------------------------
  // Unary operators
  // -----------------------------

  if (value.length === 2) {
    const val = evaluateNode(evalTree, value[1], context)
    const op = value[0]
    if (op === '∅') {
      return val === undefined
    }
    if (op === '-') {
      if (typeof val !== 'number') return val as null | undefined
      return -val
    }
  }

  // -----------------------------
  // Binary operators
  // -----------------------------

  if (value.length === 3) {
    const left = evaluateNode(evalTree, value[0], context)
    const op = value[1]

    // LAZY
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

    const right = evaluateNode(evalTree, value[2], context)
    if (left == undefined) {
      if (right === 0 && op === '*') return 0
      if (right === 0 && op === '**') return 1
      if (right === 0 && op === '/') throw new RuntimeError('Division by zero')
      if (right === false && op === '&&') return false
      if (right === true && op === '||') return true
      return undefined
    }
    if (right == undefined) return right

    if (op === '+') {
      return left + right
    }
    if (op === '-') {
      return left - right
    }
    if (op === '*') {
      return left * right
    }
    if (op === '/') {
      return left / right
    }
    if (op === '**') {
      return left ** right
    }

    if (op === '!=') {
      return left !== right
    }
    if (op === '<') {
      return left < right
    }
    if (op === '<=') {
      return left <= right
    }
    if (op === '>') {
      return left > right
    }
    if (op === '>=') {
      return left >= right
    }
    if (op === '=') {
      return left === right
    }
    if (op === '&&') {
      return left && right
    }
    if (op === '||') {
      return left || right
    }

    throw new RuntimeError('Internal error : Invalid operation')
  }
}

const LazyNullOps: BinaryOp[] = ['*', '/', '**', '<', '<=', '>', '>=']
