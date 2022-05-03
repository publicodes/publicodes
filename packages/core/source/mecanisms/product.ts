import { createParseInlinedMecanism } from './utils'

export default createParseInlinedMecanism(
	'produit',
	{
		assiette: {},
		taux: { 'par défaut': '100%' },
		facteur: { 'par défaut': 1 },
		plafond: {
			'par défaut': {
				'applicable si': 'non',
			},
		},
	},
	{
		'*': [
			{ '*': ['taux', 'facteur'] },
			{ valeur: 'assiette', plafond: 'plafond' },
		],
		"simplifier l'unité": 'oui',
	}
)
