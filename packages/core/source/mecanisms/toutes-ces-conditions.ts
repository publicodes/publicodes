import { PublicodesExpression } from '..'
import { createParseInlinedMecanismWithArray } from './inlineMecanism'

export default createParseInlinedMecanismWithArray(
	'toutes ces conditions',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) =>
		(valeur as Array<PublicodesExpression>).reduce(
			(acc, value) => ({ et: [acc, value] }),
			'oui'
		)
)
