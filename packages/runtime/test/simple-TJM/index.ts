import Engine from '../../src'
import rules from './model.publicodes.json'

const engine = new Engine(rules)

const revenuNet = engine.evaluate('revenu net', {
  "chiffre d'affaires . TJM": 450,
  'auto-entrepreneur': true,
})

console.log('revenu net: ', revenuNet)
