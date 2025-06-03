import { evaluateNode, debug } from './evaluate'
import { Publicodes, Outputs, GetContext, Evaluation, RuleName } from './types'

export class Engine<O extends Outputs> {
  constructor(private publicodes: Publicodes<O>) {}

  evaluate<R extends RuleName<O>>(
    rule: R,
    context: GetContext<O, R> = {},
    debug = false,
  ): Evaluation<O, R> {
    const evalTree = this.publicodes.evaluation
    const output = this.publicodes.outputs[rule]
    // Todo : convert date in / out
    // if (debug) {
    //   debug.activate()
    // }
    const { p, v } = evaluateNode(
      evalTree,
      evalTree[output.nodeIndex],
      context,
    ) as unknown as Evaluation<O, R>

    // if (debug) {
    //   debug.log()
    // }

    const neededParameters = new Set(p)
    const parametersInContext = new Set(Object.keys(context))

    return {
      value: v,
      neededParameters: [...neededParameters],
      missingParameters: [...neededParameters.difference(parametersInContext)],
    }
  }
}
