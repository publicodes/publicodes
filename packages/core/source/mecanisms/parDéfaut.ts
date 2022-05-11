import { createParseInlinedMecanism } from './utils'

export default createParseInlinedMecanism(
	'par défaut',
	{
		'par défaut': {},
		valeur: {},
	},
	{
		condition: {
			si: { 'est non défini': 'valeur' },
			alors: 'par défaut',
			sinon: 'valeur',
		},
	}
)
