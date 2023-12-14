import { PublicodesExpression } from '..'
import { createParseInlinedMecanismWithArray } from './inlineMecanism'
import { reduceToSumNodes } from './somme'

export default createParseInlinedMecanismWithArray(
	'moyenne',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) => {
		const valeurs = [...(valeur as Array<PublicodesExpression>)]

		return {
			'/': [
				reduceToSumNodes(valeurs),
				reduceToSumNodes(valeurs.map(oneIfApplicable)),
			],
		}
	},
)

function oneIfApplicable(exp: PublicodesExpression): PublicodesExpression {
	return {
		'applicable si': { 'est applicable': exp },
		valeur: 1,
	}
}
