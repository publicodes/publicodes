import { createParseInlinedMecanismWithArray } from './utils'

export default createParseInlinedMecanismWithArray(
	'toutes ces conditions',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) => valeur.reduce((acc, value) => ({ ou: [acc, value] }), 'non')
)
