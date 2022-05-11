import { createParseInlinedMecanismWithArray } from './utils'

export default createParseInlinedMecanismWithArray(
	'somme',
	{
		valeur: { type: 'tableau' },
	},
	({ valeur }) => valeur.reduce((acc, value) => ({ '+': [acc, value] }), '0')
)
