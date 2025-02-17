import { bench, group, run } from 'mitata'
import { parseExpression } from '../src/parseExpression'

import { parseExpression as parseExpressionOld } from 'publicodes-old'

let res
let resNext

// NOTE:
// - Nearley cannot parse: -(1 + (10 + 20)) * 30
// - Nearley can parse: 10 < oui
//
//
// const e = '-1 + (10 + 20) * 30'
//
// group(`Simple expression: ${e}`, () => {
// 	bench('Nearley', () => {
// 		res = parseExpression(e, '')
// 	})
//
// 	bench('Hand-written', () => {
// 		resNext = parseExpressionNext(e, '')
// 	})
// })
//
const e2 = '10 + 20'

group(`Simple expression with comparison: ${e2}`, () => {
	bench('Nearley', () => {
		res = parseExpressionOld(e2, '')
	})

	bench('Hand-written', () => {
		resNext = parseExpression(e2, '')
	})
})

await run()
//
console.log('Nearley:', JSON.stringify(res, null, 2))
console.log('Hand-written:', JSON.stringify(resNext, null, 2))
