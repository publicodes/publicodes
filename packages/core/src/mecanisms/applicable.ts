import { notApplicableNode } from '../evaluationUtils'
import { createParseInlinedMecanism } from './inlineMecanism'

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
	},
)
