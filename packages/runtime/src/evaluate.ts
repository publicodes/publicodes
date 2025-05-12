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
  contexte: unknown,
): Value {
  if (typeof value === 'string')
    // -----------------------------
    // Reference
    // -----------------------------
    return evaluateNode(evalTree, evalTree[value], contexte)

  if (value === null) return null
  if (typeof value === 'boolean') return value

  if (!('length' in value)) {
    // -----------------------------
    // Conditional (ternary)
    // -----------------------------

    if ('if' in value) {
      const condition = evaluateNode(evalTree, value.if, contexte)
      if (condition === null) {
        return null
      } else if (condition === undefined) {
        evaluateNode(evalTree, value.then, contexte)
        evaluateNode(evalTree, value.else, contexte)
        return
      } else if (condition === true) {
        return evaluateNode(evalTree, value.then, contexte)
      } else {
        // (condition === false)
        return evaluateNode(evalTree, value.else, contexte)
      }
    }

    // -----------------------------
    // Date
    // -----------------------------
    if ('d' in value) {
      return new Date(value.d).valueOf()
    }
  }
  if (value.length === 0) return undefined

  if (value.length === 1) return value[0]

  // -----------------------------
  // Unary operators
  // -----------------------------

  if (value.length === 2) {
    const val = evaluateNode(evalTree, value[1], contexte)
    const op = value[0]
    if (typeof val !== 'number') return val as null | undefined
    if (op === '-') {
      return -val
    }
  }

  // -----------------------------
  // Binary operators
  // -----------------------------

  if (value.length === 3) {
    const left = evaluateNode(evalTree, value[0], contexte)
    const op = value[1]

    // LAZY
    if (left === null && LazyNullOps.includes(op)) {
      return left
    }
    if (left === 0 && (op === '*' || op === '/' || op === '**')) {
      return left
    }
    if (left === false && op === '&&') {
      return left
    }
    if (left === true && op === '||') {
      return left
    }

    const right = evaluateNode(evalTree, value[2], contexte)
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

const LazyNullOps: BinaryOp[] = [
  '*',
  '/',
  '**',
  '=',
  '!=',
  '<',
  '<=',
  '>',
  '>=',
  '&&',
]
