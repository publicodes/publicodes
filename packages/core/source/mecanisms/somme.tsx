import { ASTNode, PublicodesExpression } from '..'
import {
	createParseInlinedMecanismWithArray,
	notApplicableNode,
} from './inlineMecanism'

export function reduceToSumNodesAndApply(
	valeurs: Array<PublicodesExpression>,
	fn: (x: PublicodesExpression) => PublicodesExpression
): ASTNode {
	return valeurs
		.reverse()
		.reduce(
			(acc, value) => ({ '+': [fn(value), acc] }),
			notApplicableNode
		) as ASTNode
}

export function reduceToSumNodes(
	valeurs: Array<PublicodesExpression>
): ASTNode {
	return reduceToSumNodesAndApply(valeurs, (v: PublicodesExpression) => v)
}

export default createParseInlinedMecanismWithArray(
	'somme',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) => reduceToSumNodes([...(valeur as Array<PublicodesExpression>)])
)
