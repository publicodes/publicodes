/**
 * Optimized memoization for functions with 3 arguments where only the last two change
 */

import evaluateNode, { Value, Context } from './evaluate'
import { Computation, Outputs, Publicodes } from './types'

export class Memoizer<O extends Outputs> {
  /**
   * The cache is a record of node index to WeakMaps, where each WeakMap is keyed by a Context and stores a Value.
   * The only node index that are cached corresponds to :
   * - `Context` mechanisme
   * - parameters / outputs of the model
   */
  private cache: Record<number, WeakMap<Context, Value>>
  private evaluation: readonly Computation[]
  constructor(publicodes: Publicodes<O>) {
    this.cache = {}
    this.evaluation = publicodes.evaluation as readonly Computation[]
    Object.values(publicodes.outputs).forEach(
      (o) => (this.cache[o.nodeIndex!] = new WeakMap<Context, Value>()),
    )
    this.evaluation.forEach((node, index) => {
      if (node && typeof node === 'object' && 'context' in node) {
        this.cache[index] = new WeakMap<Context, Value>()
      }
    })
  }

  evaluateNode(id: number, context: Context): Value {
    if (!(id in this.cache)) {
      return evaluateNode(this.evaluation, id, context)
    }

    const cache = this.cache[id]

    let result = cache.get(context)
    if (result) {
      return result
    }

    result = evaluateNode(this.evaluation, id, context)
    cache.set(context, result)
    return result
  }
}
