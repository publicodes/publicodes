import { createParseInlinedMecanism } from './utils'

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
			sinon: {
				constant: {
					type: undefined,
					nodeValue: null,
				},
			},
		},
	}
)
