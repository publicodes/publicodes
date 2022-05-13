import { createParseInlinedMecanismWithArray } from './utils'

export default createParseInlinedMecanismWithArray(
	'somme',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) => valeur.reduce((acc, value) => ({ '+': [acc, value] }), '0')
)
