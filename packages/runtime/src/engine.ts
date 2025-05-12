import { evaluateNode } from './evaluate'
import {
  Outputs,
  Publicodes,
  Types,
  Parameters,
  GetContext,
  GetType,
} from './types'

export class Engine<
  O extends Outputs,
  T extends Types<O>,
  P extends Parameters<O>,
> {
  constructor(private publicodes: Publicodes<O, T, P>) {}
  evaluate<R extends O>(
    rule: R,
    context: GetContext<O, T, P, R> = {},
  ): GetType<T[R]> {
    return evaluateNode(
      this.publicodes.evaluationTree,
      this.publicodes.evaluationTree[rule],
      context,
    ) as GetType<T[R]>
  }
}
