import Engine from '../../src'
import JSEngine from './model.publicodes.js'
import rules from './model.publicodes.json'

const engine = new Engine(rules)
const jsEngine = new JSEngine()

const context = {
  "chiffre d'affaires . TJM": 450,
  'auto-entrepreneur': true,
}
const revenuNet = console.log(
  'exemples . CA élevé: ',
  engine.evaluate('exemples . CA élevé', context),
  jsEngine.evaluate('exemples . CA élevé', context),
)
