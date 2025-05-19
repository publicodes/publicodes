import { BinaryOp, EvaluationTree, Computation, Value } from './types'

class RuntimeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RuntimeError'
  }
}

export type Value = {
  value: number | string | boolean | null | undefined | Date
  inputs: Array<string>
}
export function evaluateNode(
  evalTree: EvaluationTree,
  c: Computation,
  context: unknown = {},
): Value {
  if (typeof c === 'string')
    // -----------------------------
    // Reference
    // -----------------------------
    return evaluateNode(evalTree, evalTree[c], context)

  if (c === null) return { value: null, inputs: [] }
  if (typeof c === 'boolean') return { value: c, inputs: [] }

  if (!('length' in c)) {
    // -----------------------------
    // Conditional (ternary)
    // -----------------------------

    if ('if' in c) {
      const condition = evaluateNode(evalTree, c.if, context)

      if (condition.value === null || condition.value === undefined) {
        return condition
      }

      const val = evaluateNode(
        evalTree,
        condition.value ? c.then : c.else,
        context,
      )

      return {
        value: val.value,
        inputs: condition.inputs.concat(val.inputs),
      }
    }

    // -----------------------------
    // Date
    // -----------------------------
    if ('d' in c) {
      return { value: new Date(c.d).valueOf(), inputs: [] }
    }
    // -----------------------------
    // Get context
    // -----------------------------
    if ('get' in c) {
      return { value: context[c.get], inputs: [c.get] }
    }
    // -----------------------------
    // Set context
    // -----------------------------
    if ('context' in c) {
      const newContext = { ...context }
      let inputs = []
      for (const rule in c.context) {
        let val = evaluateNode(evalTree, val.context[rule], context)
        newContext[rule] = val.value
        inputs.push(...val.inputs)
      }
      let value = evaluateNode(evalTree, c.value, newContext)
      value.inputs.push(...inputs)
      return value
    }
  }
  if (c.length === 0)
    return {
      value: undefined,
      inputs: [],
    }

  if (c.length === 1)
    return {
      value: c[0],
      inputs: [],
    }

  // -----------------------------
  // Unary operators
  // -----------------------------

  if (c.length === 2) {
    const val = evaluateNode(evalTree, c[1], context)
    const op = c[0]
    if (op === '∅') {
      return {
        value: val.value === undefined,
        inputs: val.inputs,
      }
    }
    if (op === '-') {
      if (typeof val.value !== 'number') return val
      return { value: -val.value, inputs: val.inputs }
    }
  }

  // -----------------------------
  // Binary operators
  // -----------------------------

  if (c.length === 3) {
    const left = evaluateNode(evalTree, c[0], context)
    const op = c[1]

    // LAZY (First operand)
    if (left.value === null && LazyNullOps.includes(op)) {
      return left
    }
    if (left.value === 0 && (op === '*' || op === '/' || op === '**')) {
      return left
    }
    if ((left.value === false || left.value === null) && op === '&&') {
      return { value: false, inputs: left.inputs }
    }
    if (left.value === true && op === '||') {
      return left
    }

    // LAZY (Second operand)
    const right = evaluateNode(evalTree, c[2], context)
    if (left.value == undefined) {
      if (right.value === 0 && op === '*')
        return { value: 0, inputs: right.inputs }
      if (right.value === 0 && op === '**')
        return { value: 1, inputs: right.inputs }
      if (right.value === 0 && op === '/')
        throw new RuntimeError('Division by zero')
      if (right.value === false && op === '&&')
        return { value: false, inputs: right.inputs }
      if (right.value === true && op === '||')
        return { value: true, inputs: right.inputs }
      return { value: undefined, inputs: right.inputs }
    }
    if (right == undefined) return right
    let v
    if (op === '+') {
      v = left.value + right.value
    } else if (op === '-') {
      v = left.value - right.value
    } else if (op === '*') {
      v = left.value * right.value
    } else if (op === '/') {
      v = left.value / right.value
    } else if (op === '**') {
      v = left.value ** right.value
    } else if (op === '!=') {
      v = left.value !== right.value
    } else if (op === '<') {
      v = left.value < right.value
    } else if (op === '<=') {
      v = left.value <= right.value
    } else if (op === '>') {
      v = left.value > right.value
    } else if (op === '>=') {
      v = left.value >= right.value
    } else if (op === '=') {
      v = left.value === right.value
    } else if (op === '&&') {
      v = left.value && right.value
    } else if (op === '||') {
      v = left.value || right.value
    } else {
      throw new RuntimeError('Internal error : Invalid operation')
    }
    return { value: v, inputs: left.inputs.concat(right.inputs) }
  }
}

const LazyNullOps: BinaryOp[] = ['*', '/', '**', '<', '<=', '>', '>=']
