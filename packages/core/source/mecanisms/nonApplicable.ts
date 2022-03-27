import { EvaluationFunction } from '..'
import { ASTNode, EvaluatedNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'

export type NonApplicableSiNode = {
	explanation: {
		condition: ASTNode
		valeur: ASTNode
	}
	nodeKind: 'non applicable si'
}

const evaluate: EvaluationFunction<'non applicable si'> = function (node) {
	const condition = this.evaluate(node.explanation.condition)
	let valeur = node.explanation.valeur
	if (condition.nodeValue === false || condition.nodeValue === null) {
		valeur = this.evaluate(valeur)
	}
	return {
		...node,
		nodeValue:
			condition.nodeValue === undefined
				? undefined
				: condition.nodeValue !== false && condition.nodeValue !== null
				? null
				: 'nodeValue' in valeur
				? (valeur as EvaluatedNode).nodeValue
				: undefined,
		explanation: { valeur, condition },
		...('unit' in valeur && { unit: valeur.unit }),
	}
}

export default function parseNonApplicable(v, context) {
	const explanation = {
		valeur: parse(v.valeur, context),
		condition: parse(v[parseNonApplicable.nom], context),
	}
	return {
		explanation,
		nodeKind: parseNonApplicable.nom,
	} as NonApplicableSiNode
}

parseNonApplicable.nom = 'non applicable si' as const

registerEvaluationFunction(parseNonApplicable.nom, evaluate)
