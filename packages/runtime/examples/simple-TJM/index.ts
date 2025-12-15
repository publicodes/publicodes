import { PublicodesEngine } from '../../src'
import rules from './model.publicodes.json'

const engine = new PublicodesEngine(rules)

const revenuNet = engine.evaluate('revenu net', {
	"chiffre d'affaires . TJM": 450,
	'auto-entrepreneur': true,
})

console.log('revenu net: ', revenuNet)
