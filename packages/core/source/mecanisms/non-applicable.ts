import { notApplicableNode } from '../evaluationUtils'
import { createParseInlinedMecanism } from './inlineMecanism'

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
