import { ASTNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { mergeMissing } from '../evaluationUtils'
import parse from '../parse'

export type VariableManquanteNode = {
	missingVariable: string
	explanation: ASTNode
	nodeKind: 'variable manquante'
}

export default function parseVariableManquante(
	v,
	context
): VariableManquanteNode {
	return {
		missingVariable: v['variable manquante'],
		nodeKind: parseVariableManquante.nom,
		explanation: parse(v.valeur, context),
	}
}

parseVariableManquante.nom = 'variable manquante' as const

registerEvaluationFunction(parseVariableManquante.nom, function evaluate(node) {
	const valeur = this.evaluateNode(node.explanation)

	const maxMissingScore = Object.values(valeur.missingVariables).reduce<number>(
		(a, b) => (a > b ? a : b),
		0
	)

	return {
		...node,
		nodeValue: valeur.nodeValue,
		unit: valeur.unit,
		explanation: valeur,
		missingVariables: mergeMissing(valeur.missingVariables, {
			[node.missingVariable]: maxMissingScore + 1,
		}),
	}
})
