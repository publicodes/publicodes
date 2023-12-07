import { PublicodesExpression } from '..'
import { defaultNode } from '../evaluationUtils'
import { createParseInlinedMecanismWithArray } from './inlineMecanism'

export function reduceToProduitNodes(
	valeurs: Array<PublicodesExpression>,
): PublicodesExpression {
	return valeurs.reduce((acc, value) => ({ '*': [value, acc] }), defaultNode(1))
}

export default createParseInlinedMecanismWithArray(
	'produit',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) => ({
		valeur: reduceToProduitNodes([...(valeur as Array<PublicodesExpression>)]),
		"simplifier l'unité": 'oui',
	}),
)
