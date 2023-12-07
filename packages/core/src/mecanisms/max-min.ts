import { PublicodesExpression } from '..'
import { notApplicableNode } from '../evaluationUtils'
import { createParseInlinedMecanismWithArray } from './inlineMecanism'

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
						'est non applicable': '$INTERNAL valeur',
					},
					alors: '$INTERNAL acc',
					sinon: {
						condition: {
							si: {
								ou: [
									{ 'est non applicable': '$INTERNAL acc' },
									{ '>': ['$INTERNAL valeur', '$INTERNAL acc'] },
								],
							},
							alors: '$INTERNAL valeur',
							sinon: '$INTERNAL acc',
						},
					},
				},
				avec: {
					'[privé] $INTERNAL valeur': { valeur: value },
					'[privé] $INTERNAL acc': { valeur: acc },
				},
			}),
			notApplicableNode,
		),
)

export const parseMinimumDe = createParseInlinedMecanismWithArray(
	'le minimum de',
	{
		valeur: { type: 'liste' },
	},
	({ valeur }) =>
		(valeur as Array<PublicodesExpression>).reduce(
			(acc, value) => ({
				condition: {
					si: {
						'est non applicable': '$INTERNAL valeur',
					},
					alors: '$INTERNAL acc',
					sinon: {
						condition: {
							si: {
								ou: [
									{ 'est non applicable': '$INTERNAL acc' },
									{ '<': ['$INTERNAL valeur', '$INTERNAL acc'] },
								],
							},
							alors: '$INTERNAL valeur',
							sinon: '$INTERNAL acc',
						},
					},
				},
				avec: {
					'[privé] $INTERNAL valeur': { valeur: value },
					'[privé] $INTERNAL acc': { valeur: acc },
				},
			}),
			notApplicableNode,
		),
)
