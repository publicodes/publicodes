import { PublicodesExpression } from '..'
import { createParseInlinedMecanismWithArray } from './utils'

export const parseMaximumDe = createParseInlinedMecanismWithArray(
	'le maximum de',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) =>
		(valeur as Array<PublicodesExpression>).reduce(
			(acc, value) => ({
				valeur: value,
				plancher: acc,
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
		(valeur as Array<PublicodesExpression>).reduce(
			(acc, value) => ({
				valeur: value,
				plafond: acc,
			}),
			{
				constant: {
					nodeValue: Infinity,
					type: 'number',
				},
			}
		)
)
