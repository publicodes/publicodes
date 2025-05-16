import Engine from '../../src'
import rules from './rules.json'

const engine = new Engine(rules)

const f = 22

console.log('f', engine.evaluate('f', { f }))
console.log('a', engine.evaluate('a', { b: 5 }))
