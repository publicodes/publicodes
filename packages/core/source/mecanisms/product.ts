import { createParseInlinedMecanism, notApplicableNode } from './inlineMecanism'

export default createParseInlinedMecanism(
	'produit',
	{
		assiette: {},
		taux: { 'par défaut': '100%' },
		facteur: { 'par défaut': 1 },
		plafond: {
			'par défaut': notApplicableNode,
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
