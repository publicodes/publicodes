import { InternalError } from './error'
import { registerEvaluationFunction } from './evaluationFunctions'
import { Context } from './parsePublicodes'

export type ReferenceNode = {
	nodeKind: 'reference'
	name: string
	contextDottedName: string
	dottedName?: string

	/**
	 * Some mechanisms use circular references with special runtime handling to
	 * avoid infinite loops. We could use a separate node kind in the AST to
	 * materialize that it's a reference that doesn't create a real dependency in
	 * the graph, but we still want to benefit from the normal name resolution and
	 * replacements of general references.
	 */
	circularReference: boolean
}

export default function parseReference(
	v: string,
	context: Context
): ReferenceNode {
	return {
		nodeKind: 'reference',
		name: v,
		contextDottedName: context.dottedName,
		circularReference: context.circularReferences === true,
	}
}

registerEvaluationFunction('reference', function evaluateReference(node) {
	if (!node.dottedName) {
		throw new InternalError(node)
	}
	const explanation = this.evaluate(this.parsedRules[node.dottedName])

	return {
		...explanation,
		...node,
	}
})
