import { evaluateNode } from './evaluate'
import {
  Publicodes,
  Outputs,
  GetContext,
  Evaluation,
  RuleName,
  Computation,
} from './types'

export class Engine<O extends Outputs> {
  constructor(private publicodes: Publicodes<O>) {}

  evaluate<R extends RuleName<O>>(
    rule: R,
    context: GetContext<O, R> = {},
    debug = false,
  ): Evaluation<O, R> {
    const evalTree = this.publicodes.evaluation as readonly Computation[]
    const output = this.publicodes.outputs[rule]
    // Todo : convert date in / out

    const { p, v } = evaluateNode(
      evalTree,
      evalTree[output.nodeIndex!],
      context,
    )

    if (debug) {
      const evaluations = evalTree.map((node) => ({
        value: evaluateNode(evalTree, node, context).v,
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
}
