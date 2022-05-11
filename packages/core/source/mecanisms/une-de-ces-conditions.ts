import { createParseInlinedMecanismWithArray } from './utils'

export default createParseInlinedMecanismWithArray(
	'toutes ces conditions',
	{
		valeur: { type: 'tableau' },
	},
	({ valeur }) => valeur.reduce((acc, value) => ({ ou: [acc, value] }), 'non')
)
