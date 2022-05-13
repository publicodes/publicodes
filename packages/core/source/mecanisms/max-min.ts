import { createParseInlinedMecanismWithArray } from './utils'

export const parseMaximumDe = createParseInlinedMecanismWithArray(
	'le maximum de',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) =>
		valeur.reduce(
			(acc, value) => ({
				valeur: acc,
				plancher: value,
			}),
			{
				constant: {
					nodeValue: -Infinity,
					type: 'number',
				},
			}
		)
)

export const parseMinimumDe = createParseInlinedMecanismWithArray(
	'le maximum de',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) =>
		valeur.reduce(
			(acc, value) => ({
				valeur: acc,
				plafond: value,
			}),
			{
				constant: {
					nodeValue: Infinity,
					type: 'number',
				},
			}
		)
)
