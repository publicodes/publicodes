import evaluateNode, { Context } from './evaluate'
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
  private cache: Memoizer<O> | null = null

  constructor(
    private publicodes: Publicodes<O>,
    options: EngineOptions = {},
  ) {
    // console.log(publicodes)
    const { cache = false } = options

    if (cache) {
      this.cache = new Memoizer(publicodes)
    }
  }

  public get outputs(): O {
    return this.publicodes.outputs
  }

  evaluate<R extends RuleName<O>>(
    rule: R,
    context: GetContext<O, R> = emptyContext,
    debug = false,
  ): Evaluation<O, R> {
    const output = this.publicodes.outputs[rule]
    if (output === undefined) {
      throw new Error(`Rule "${rule}" doesn't exist as an output of the model`)
    }
    const evaluation = this.publicodes.evaluation as readonly Computation[]
    const evaluate = (id: number) => {
      if (this.cache) {
        return this.cache.evaluateNode(id, context as Context)
      }
      return evaluateNode(evaluation, id, context as Context)
    }

    // Todo : convert date in / out
    const { p, v } = evaluate(output.nodeIndex!)

    if (debug) {
      const evaluations = evaluation.map((node: Computation, i: number) => ({
        value: evaluate(i),
        formula: node,
      }))
      // eslint-disable-next-line no-console
      console.table(evaluations)
    }

    const neededParameters = Object.keys(p)
    const missingParameters = neededParameters.filter(
      (param) => !(param in context),
    )

    return {
      value: v,
      neededParameters,
      missingParameters,
    } as Evaluation<O, R>
  }
}

const emptyContext = {}
