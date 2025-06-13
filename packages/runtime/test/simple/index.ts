/* eslint-disable no-console */

import Engine from '../../src'
import rules from './model.publicodes.json'

const engine = new Engine(rules)

const revenuNet = engine.evaluate(
  'exemples . CA élevé',
  {
    // "chiffre d'affaires": 10000,
    'auto-entrepreneur': true,
    // charges: 100,
  },
  true,
)

console.log('revenu net: ', revenuNet)
