import { createParseInlinedMecanism } from './utils'

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
