import type { RawRules } from '../src/lib'
import { getRawNodes } from '../src/lib'

import { callWithParsedRules } from './utils.test'

function getRawNodesWith(rawRules: RawRules): RawRules {
	return callWithParsedRules(getRawNodes, rawRules)
}

describe('getRawRules', () => {
	it('∅ -> ∅', () => {
		expect(getRawNodesWith({})).toStrictEqual({})
	})
	it('Single null rule', () => {
		expect(getRawNodesWith({ test1: null })).toStrictEqual({
			test1: {},
		})
	})
	it('Simple single rule', () => {
		const rawRules = {
			test2: {
				titre: 'Test 2',
				formule: '10 * 3',
			},
		}
		expect(getRawNodesWith(rawRules)).toStrictEqual(rawRules)
	})
	it('Number constant', () => {
		expect(getRawNodesWith({ test3: 10 })).toStrictEqual({
			test3: { valeur: '10' },
		}) // will be reparsed by the website client, so not a problem?
	})
	it('Referenced rules', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				formule: 'B . C * 3',
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		expect(getRawNodesWith(rawRules)).toStrictEqual(rawRules)
	})
})
