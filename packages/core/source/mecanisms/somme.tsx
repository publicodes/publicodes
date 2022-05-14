import { createParseInlinedMecanismWithArray } from './utils'

export default createParseInlinedMecanismWithArray(
	'somme',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) =>
		[...valeur].reverse().reduce((acc, value) => ({ '+': [value, acc] }), {
			constant: {
				nodeValue: null,
				isNullable: true,
				type: undefined,
			},
		})
)
