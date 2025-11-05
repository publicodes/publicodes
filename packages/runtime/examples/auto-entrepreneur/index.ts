/* eslint-disable no-console */
import rules from './model.publicodes.js'

const context = {
	"entreprise . chiffre d'affaires . BIC": 0,
	"entreprise . chiffre d'affaires . service BIC": 10000,
	"entreprise . chiffre d'affaires . service BNC": 0,
	"entreprise . chiffre d'affaires . vente restauration hébergement": 0,
	'entreprise . activité . nature': 'libérale',
	'entreprise . activité . nature . libérale . réglementée': false,
	date: new Date('2025-05-20'),
	'dirigeant . auto-entrepreneur . Cipav . adhérent': false,
	'entreprise . date de création': new Date('2025-05-20'),
	"entreprise . durée d'activité . trimestres civils": 10,
	"entreprise . durée d'activité . années civiles": 5,
} as const

console.log(
	rules['dirigeant . auto-entrepreneur . revenu net'].evaluateParams(context),
)
