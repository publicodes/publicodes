import { PublicodesExpression } from '..'
import {
	createParseInlinedMecanismWithArray,
	notApplicableNode,
} from './inlineMecanism'

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
