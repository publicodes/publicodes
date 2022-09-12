import { PublicodesInternalError } from './error'
import { registerEvaluationFunction } from './evaluationFunctions'
import { Context } from './parsePublicodes'

export type ReferenceNode = {
	nodeKind: 'reference'
	name: string
	contextDottedName: string
	dottedName?: string
	title?: string
	acronym?: string
}

export default function parseReference(
	v: string,
	context: Context
): ReferenceNode {
	if (!context.dottedName) {
		throw new PublicodesInternalError({
			message:
				"Une référence ne peut pas exister en dehors d'une règle (`context.dottedName` est vide)",
			context,
		})
	}
	return {
		nodeKind: 'reference',
		name: v,
		contextDottedName: context.dottedName,
	}
}

registerEvaluationFunction('reference', function evaluateReference(node) {
	if (!node.dottedName) {
		throw new PublicodesInternalError(node)
	}
	const explanation = this.evaluateNode(
		this.context.parsedRules[node.dottedName]
	)
	delete explanation.sourceMap
	return {
		...explanation,
		...node,
	}
})
