import Engine from '../../src'
import rules from './test.ts'

const engine = new Engine(rules)

const value = engine.evaluate('d')
