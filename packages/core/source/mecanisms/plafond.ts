import { createParseInlinedMecanism } from './utils'

export default createParseInlinedMecanism(
	'plafond',
	{
		plafond: {},
		valeur: {},
	},
	{
		condition: {
			si: { 'toutes ces conditions': ['plafond != non', 'valeur > plafond'] },
			alors: 'plafond',
			sinon: 'valeur',
		},
	}
)
