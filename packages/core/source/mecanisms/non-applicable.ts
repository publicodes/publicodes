import { createParseInlinedMecanism, notApplicableNode } from './inlineMecanism'

export default createParseInlinedMecanism(
	'non applicable si',
	{
		'non applicable si': {},
		valeur: {},
	},
	{
		condition: {
			si: 'non applicable si = non',
			alors: 'valeur',
			sinon: notApplicableNode,
		},
	}
)
