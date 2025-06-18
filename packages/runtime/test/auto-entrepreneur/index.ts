import Engine from '../../src/index.ts'
import rules from './model.publicodes.json' with { type: 'json' }
import JsEngine from './js-output/engine.js'

const engine = new Engine(rules)
const jsEngine = new JsEngine()

const context = {
	"entreprise . chiffre d'affaires . BIC": 0,
	"entreprise . chiffre d'affaires . service BIC": 10000,
	"entreprise . chiffre d'affaires . service BNC": 0,
	"entreprise . chiffre d'affaires . vente restauration hébergement": 0,
	'entreprise . activité . nature': 'libérale',
	'entreprise . activité . nature . libérale . réglementée': false,
	date: new Date('2025-05-20'),
	'dirigeant . auto-entrepreneur . Cipav . adhérent': false,
	// 'entreprise . date de création': new Date('2025-05-20'),
}

console.time('New engine')
console.log(
	'revenu net',
	engine.evaluate('dirigeant . auto-entrepreneur . revenu net', context),
)

console.log(
	'cotisations',
	engine.evaluate(
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
		context,
	),
)
console.timeEnd('New engine')

console.time('JS engine')
console.log(
	'revenu net',
	jsEngine.evaluate('dirigeant . auto-entrepreneur . revenu net', context),
)
console.log(
	'cotisations',
	jsEngine.evaluate(
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
		context,
	),
)
console.timeEnd('JS engine')
