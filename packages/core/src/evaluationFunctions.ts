import { EvaluationFunction, PublicodesError } from '.'
import { ASTNode } from './AST/types'

export let evaluationFunctions = {
	constant: (node) => node,
} as any

export function registerEvaluationFunction<
	NodeName extends ASTNode['nodeKind'],
>(nodeKind: NodeName, evaluationFunction: EvaluationFunction<NodeName>) {
	evaluationFunctions ??= {}
	if (evaluationFunctions[nodeKind]) {
		throw new PublicodesError(
			'EvaluationError',
			`Multiple evaluation functions registered for the nodeKind \x1b[4m${nodeKind}`,
			{ dottedName: '' },
		)
	}
	evaluationFunctions[nodeKind] = evaluationFunction
}
