import { ASTNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'
import { convertUnit, simplifyUnit } from '../units'

export type SimplifierUnitéNode = {
	explanation: ASTNode
	nodeKind: 'simplifier unité'
}

export default function parseSimplifierUnité(v, context): SimplifierUnitéNode {
	const explanation = parse(v.valeur, context)
	return {
		explanation,
		nodeKind: 'simplifier unité',
	}
}

parseSimplifierUnité.nom = "simplifier l'unité" as const

registerEvaluationFunction('simplifier unité', function evaluate(node) {
	const valeur = this.evaluateNode(node.explanation)
	const nodeValue = valeur.nodeValue
	const defaultReturn = {
		...valeur,
		...node,
		explanation: valeur,
	}
	if (nodeValue == null) {
		return defaultReturn
	}

	if (!valeur.unit) {
		return {
			...defaultReturn,
			unit: valeur.unit,
		}
	}
	const unit = simplifyUnit(valeur.unit)

	return {
		...defaultReturn,
		nodeValue:
			typeof nodeValue === 'number'
				? convertUnit(valeur.unit, unit, nodeValue)
				: nodeValue,
		unit,
	}
})
