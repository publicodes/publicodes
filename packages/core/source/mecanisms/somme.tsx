import { ASTNode, PublicodesExpression } from '..'
import {
	createParseInlinedMecanismWithArray,
	notApplicableNode,
} from './inlineMecanism'

export function reduceToSumNodes(
	valeurs: Array<PublicodesExpression>
): ASTNode {
	return valeurs
		.reverse()
		.reduce(
			(acc, value) => ({ '+': [value, acc] }),
			notApplicableNode
		) as ASTNode
}

export default createParseInlinedMecanismWithArray(
	'somme',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) => reduceToSumNodes([...(valeur as Array<PublicodesExpression>)])
)
