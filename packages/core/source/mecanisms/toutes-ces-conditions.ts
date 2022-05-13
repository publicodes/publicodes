import { createParseInlinedMecanismWithArray } from './utils'

export default createParseInlinedMecanismWithArray(
	'toutes ces conditions',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) => valeur.reduce((acc, value) => ({ et: [acc, value] }), 'oui')
)
