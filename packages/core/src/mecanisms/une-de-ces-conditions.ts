import { PublicodesExpression } from '..'
import { createParseInlinedMecanismWithArray } from './inlineMecanism'

export default createParseInlinedMecanismWithArray(
	'une de ces conditions',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) =>
		(valeur as Array<PublicodesExpression>).reduce(
			(acc, value) => ({ ou: [acc, value] }),
			'non'
		)
)
