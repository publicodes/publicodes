import { PublicodesExpression } from './'
import { EvaluatedNode } from './index'
import { serializeUnit } from './units'

/**
 * Serialize the evaluation of a node into a publicodes expression
 *
 */
export default function serializeEvaluation(
	node: EvaluatedNode,
): PublicodesExpression | undefined {
	if (typeof node.nodeValue === 'number') {
		const serializedUnit = serializeUnit(node.unit)
		return (
			'' +
			node.nodeValue +
			(serializedUnit ? serializedUnit.replace(/\s/g, '') : '')
		)
	} else if (typeof node.nodeValue === 'boolean') {
		return node.nodeValue ? 'oui' : 'non'
	} else if (typeof node.nodeValue === 'string') {
		return `'${node.nodeValue}'`
	}
}
