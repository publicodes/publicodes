import { PublicodesExpression } from '..'
import { notApplicableNode } from '../evaluationUtils'
import { createParseInlinedMecanismWithArray } from './inlineMecanism'

export function reduceToSumNodes(
	valeurs: Array<PublicodesExpression>
): PublicodesExpression {
	return valeurs
		.reverse()
		.reduce((acc, value) => ({ '+': [value, acc] }), notApplicableNode)
}

export default createParseInlinedMecanismWithArray(
	'somme',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) => reduceToSumNodes([...(valeur as Array<PublicodesExpression>)])
)
