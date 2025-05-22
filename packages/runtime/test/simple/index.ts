/* eslint-disable no-console */

import Engine from '../../src'
import rules from './model.publicodes.json'

const engine = new Engine(rules)

const revenuNet = engine.evaluate('revenu net', {
	"chiffre d'affaires": 100,
	'auto-entrepreneur': true,
	charges: 100,
})

console.log('revenu net: ', revenuNet)
