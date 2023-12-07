import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'
import { createParseInlinedMecanism } from './inlineMecanism'

export type EstNonDéfiniNode = {
	explanation: ASTNode
	nodeKind: 'est non défini'
}

export function parseEstNonDéfini(v, context) {
	const explanation = parse(v, context)
	return {
		explanation,
		nodeKind: 'est non défini',
	} as EstNonDéfiniNode
}
parseEstNonDéfini.nom = 'est non défini'

const parseEstDéfini = createParseInlinedMecanism(
	'est défini',
	{
		valeur: {},
	},
	{
		'=': [{ 'est non défini': 'valeur' }, 'non'],
	},
)

const parseEstApplicable = createParseInlinedMecanism(
	'est applicable',
	{
		valeur: {},
	},
	{
		'=': [{ 'est non applicable': 'valeur' }, 'non'],
	},
)

export { parseEstDéfini, parseEstApplicable }

const evaluate: EvaluationFunction<'est non défini'> = function (node) {
	const valeur = this.evaluateNode(node.explanation)
	let nodeValue: boolean | undefined | null = false
	if (valeur.nodeValue === undefined) {
		nodeValue = true
	}

	return {
		...node,
		nodeValue,
		missingVariables: valeur.missingVariables,
		explanation: valeur,
	}
}
registerEvaluationFunction('est non défini', evaluate)
