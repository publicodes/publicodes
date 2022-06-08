import { createParseInlinedMecanism } from './inlineMecanism'

export default createParseInlinedMecanism(
	'abattement',
	{
		abattement: {},
		valeur: {},
	},
	{
		'-': ['valeur', 'abattement'],
		plancher: 0,
	}
)
