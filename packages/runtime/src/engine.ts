import { evaluateNode } from './evaluate'
import {
  Publicodes,
  Types,
  Parameters,
  GetContext,
  GetType,
  EvaluationTree,
} from './types'

export class Engine<T extends Types, P extends Parameters<T>> {
  constructor(private publicodes: Publicodes<T, P>) {}
  evaluate<R extends Extract<keyof T, string>>(
    rule: R,
    context: GetContext<T, P, R> = {},
  ): GetType<T[R]> {
    const evaluationTree = this.publicodes.evaluationTree as EvaluationTree
    return evaluateNode(
      evaluationTree,
      evaluationTree[rule],
      context,
    ) as GetType<T[R]>
  }
}
