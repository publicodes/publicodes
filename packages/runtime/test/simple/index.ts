import Engine from '../../src'
import rules from './test.ts'

const engine = new Engine(rules)
const result = engine.evaluate('c', {
  b: 12,
  e: 5,
})

const date = engine.evaluate('d')
