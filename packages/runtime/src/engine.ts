import evaluateNode, { Value } from './evaluate'
import { Memoizer } from './memoize'
import {
  Publicodes,
  Outputs,
  GetContext,
  Evaluation,
  RuleName,
  Computation,
} from './types'

type EngineOptions = {
  cache?: boolean
}

export class Engine<O extends Outputs> {
  private memo?: Memoizer<Computation, unknown, Value>
  private evaluation: readonly Computation[]
  private outputs: O
  private evaluateNode: (c: Computation, context: unknown) => Value

  constructor(publicodes: Publicodes<O>, options: EngineOptions = {}) {
    const { cache = false } = options
    this.evaluation = publicodes.evaluation as readonly Computation[]
    this.outputs = publicodes.outputs
    this.evaluateNode = evaluateNode.bind(null, this.evaluation)

    if (cache) {
      this.memo = new Memoizer(evaluateNode.bind(null, this.evaluation))
      this.evaluateNode = this.memo.call.bind(this.memo)
    }
  }

  evaluate<R extends RuleName<O>>(
    rule: R,
    context: GetContext<O, R> = {},
    debug = false,
  ): Evaluation<O, R> {
    const output = this.outputs[rule]
    if (output === undefined) {
      throw new Error(`Rule "${rule}" does't exists as an output of the model`)
    }

    // Todo : convert date in / out

    const { p, v } = this.evaluateNode(
      this.evaluation[output.nodeIndex!],
      context,
    )

    if (debug) {
      const evaluations = this.evaluation.map((node: Computation) => ({
        value: evaluateNode(this.evaluation, node, context).v,
        formula: node,
      }))
      // eslint-disable-next-line no-console
      console.table(evaluations)
    }

    const neededParameters = new Set(p)
    const parametersInContext = new Set(Object.keys(context))

    return {
      value: v,
      neededParameters: [...neededParameters],
      missingParameters: [...neededParameters.difference(parametersInContext)],
    } as Evaluation<O, R>
  }

  resetCache() {
    this.memo?.reset()
  }
}
