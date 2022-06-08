import { createParseInlinedMecanism, notApplicableNode } from './inlineMecanism'

export default createParseInlinedMecanism(
	'applicable si',
	{
		'applicable si': {},
		valeur: {},
	},
	{
		condition: {
			si: 'applicable si != non',
			alors: 'valeur',
			sinon: notApplicableNode,
		},
	}
)
