import { ASTNode } from '../AST/types'
import { evaluationError } from '../error'
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
	const valeur = this.evaluate(node.explanation)
	const nodeValue = valeur.nodeValue
	const defaultReturn = {
		...valeur,
		...node,
		explanation: valeur,
	}
	if (nodeValue == null) {
		return defaultReturn
	}
	if (!('unit' in valeur) || typeof nodeValue !== 'number') {
		evaluationError(
			this.options.logger,
			this.cache._meta.evaluationRuleStack[0],
			"Le mécanisme `simplifier l'unité` fonctionne uniquement sur les nombres avec unités"
		)
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
		nodeValue: convertUnit(valeur.unit, unit, nodeValue),
		unit,
	}
})
