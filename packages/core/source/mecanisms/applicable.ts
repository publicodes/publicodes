import { createParseInlinedMecanism, notApplicableNode } from './utils'

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
