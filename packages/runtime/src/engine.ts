import { evaluateNode, debug } from './evaluate'
import {
  Publicodes,
  Types,
  Parameters,
  GetContext,
  Evaluation,
  RuleName,
  EvaluationTree,
} from './types'

export class Engine<T extends Types, P extends Parameters<T>> {
  constructor(private publicodes: Publicodes<T, P>) {}

  evaluate<R extends RuleName<T>>(
    rule: R,
    context: GetContext<T, P, R> = {},
  ): Evaluation<T, P, R> {
    const evaluationTree = this.publicodes.evaluationTree as EvaluationTree
    // Todo : convert date in / out
    debug.reset()
    let { value, inputs } = evaluateNode(
      evaluationTree,
      evaluationTree[rule],
      context,
    ) as unknown as Evaluation<T, P, R>
    debug.log()

    inputs = new Set(inputs)
    const contextRules = new Set(Object.keys(context))

    return {
      value,
      inputs: [...inputs],
      missingVariables: [...inputs.difference(contextRules)],
    }
  }
}
