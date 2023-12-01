import { createParseInlinedMecanism } from './inlineMecanism'

export default createParseInlinedMecanism(
	'dans la situation',
	{
		valeur: {},
		'dans la situation': {},
	},
	{
		condition: {
			si: { 'est non défini': 'dans la situation' },
			alors: 'valeur',
			sinon: 'dans la situation',
		},
	}
)
