import { evaluate } from '../../src'
import rules from './test.json'

const result = evaluate(rules, 'b . c')
console.log(result)
