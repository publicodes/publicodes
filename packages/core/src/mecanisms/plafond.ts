import { createParseInlinedMecanism } from './inlineMecanism'

export default createParseInlinedMecanism(
	'plafond',
	{
		plafond: {},
		valeur: {},
	},
	{
		condition: {
			si: { et: ['plafond != non', 'valeur > plafond'] },
			alors: 'plafond',
			sinon: 'valeur',
		},
	}
)
