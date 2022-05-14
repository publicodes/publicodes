import { createParseInlinedMecanismWithArray } from './utils'

export default createParseInlinedMecanismWithArray(
	'une de ces conditions',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) => valeur.reduce((acc, value) => ({ ou: [acc, value] }), 'non')
)
