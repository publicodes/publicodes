import { PublicodesExpression } from '..'
import { createParseInlinedMecanismWithArray, notApplicableNode } from './utils'

export const parseMaximumDe = createParseInlinedMecanismWithArray(
	'le maximum de',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) =>
		(valeur as Array<PublicodesExpression>).reduce(
			(acc, value) => ({
				condition: {
					si: {
						'est non applicable': value,
					},
					alors: acc,
					sinon: {
						valeur: value,
						plancher: acc,
					},
				},
			}),
			notApplicableNode
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
				condition: {
					si: {
						'est non applicable': value,
					},
					alors: acc,
					sinon: {
						valeur: value,
						plafond: acc,
					},
				},
			}),
			notApplicableNode
		)
)
