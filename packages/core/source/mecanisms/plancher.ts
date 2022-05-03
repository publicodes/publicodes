import { createParseInlinedMecanism } from './utils'

export default createParseInlinedMecanism(
	'plancher',
	{
		plancher: {},
		valeur: {},
	},
	{
		condition: {
			si: { 'toutes ces conditions': ['plancher != non', 'valeur < plancher'] },
			alors: 'plancher',
			sinon: 'valeur',
		},
	}
)
