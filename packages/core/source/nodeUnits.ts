import { EvaluatedNode, Unit } from './AST/types'
import { convertUnit, simplifyUnit, UnitEquivalencesTable } from './units'

export function simplifyNodeUnit(
	node,
	unitEquivalences: UnitEquivalencesTable
) {
	if (!node.unit) {
		return node
	}
	const unit = simplifyUnit(node.unit)

	return convertNodeToUnit(unit, node, unitEquivalences)
}

export function convertNodeToUnit<Node extends EvaluatedNode = EvaluatedNode>(
	to: Unit | undefined,
	node: Node,
	unitEquivalences: UnitEquivalencesTable
): Node {
	return {
		...node,
		nodeValue:
			node.unit && typeof node.nodeValue === 'number'
				? convertUnit(node.unit, to, node.nodeValue, unitEquivalences)
				: node.nodeValue,
		unit: to,
	}
}
