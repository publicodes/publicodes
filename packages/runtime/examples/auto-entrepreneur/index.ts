import { PublicodesEngine } from '../../src'
import rules from './model.publicodes.json'

const engine = new PublicodesEngine(rules)

const context = {
	"entreprise . chiffre d'affaires . BIC": 0,
	"entreprise . chiffre d'affaires . service BIC": 10000,
	"entreprise . chiffre d'affaires . service BNC": 0,
	"entreprise . chiffre d'affaires . vente restauration hébergement": 0,
	'entreprise . activité . nature': 'libérale',
	'entreprise . activité . nature . libérale . réglementée': false,
	date: new Date('2025-05-20'),
	'dirigeant . auto-entrepreneur . Cipav . adhérent': false,
}

console.log(
	'revenu net',
	engine.evaluate('dirigeant . auto-entrepreneur . revenu net', context),
)

console.log(
	engine.meta(
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC',
	).title,
)
console.log(
	'cotisations',
	engine.evaluate(
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
		context,
	),
)
