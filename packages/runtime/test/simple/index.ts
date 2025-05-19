import Engine from '../../src'
import rules from './rules.json'

const engine = new Engine(rules)

console.log('a', engine.evaluate('a'))
