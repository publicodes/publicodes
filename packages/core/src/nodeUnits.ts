import { EvaluatedNode, Unit } from './AST/types'
import { convertUnit, simplifyUnit } from './units'

/**
 * Simplify if possible the unit of a node
 *
 * If not used, the result of the evaluation of a node will have the
 * most precise unit possible, in order to prevent rounding errors.
 *
 *
 * @param node - The node to simplify
 * @returns The node its unit simplified
 *
 * @example
 * ```ts
 * simplifyNodeUnit(engine.evaluate('42 €/mois * 1 an'))
 * // returns { nodeValue: 504, unit: { numerators: ['€'], denominators: [] } }
 * ```
 */
export function simplifyNodeUnit<Node extends EvaluatedNode = EvaluatedNode>(
	node: Node,
): Node {
	if (!node.unit) {
		return node
	}
	const unit = simplifyUnit(node.unit)

	return convertNodeToUnit(unit, node)
}

export function convertNodeToUnit<Node extends EvaluatedNode = EvaluatedNode>(
	to: Unit | undefined,
	node: Node,
): Node {
	return {
		...node,
		nodeValue:
			node.unit && typeof node.nodeValue === 'number' ?
				convertUnit(node.unit, to, node.nodeValue)
			:	node.nodeValue,
		unit: to,
	}
}
