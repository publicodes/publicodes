import { constantFolding, getRawNodes } from '../src/lib'
import Engine from 'publicodes'

import type { ParsedRules, RawRules } from '../src/lib'

function callWithParsedRules<R>(
	fn: (rules: ParsedRules) => R,
	rawRules: RawRules
): R {
	return fn(new Engine(rawRules).getParsedRules())
}

function constantFoldingWith(rawRules: RawRules): RawRules {
	return getRawNodes(callWithParsedRules(constantFolding, rawRules))
}

describe('getRawRules', () => {
	it('∅ -> ∅', () => {
		expect(callWithParsedRules(getRawNodes, {})).toStrictEqual({})
	})
	it('Single null rule', () => {
		expect(callWithParsedRules(getRawNodes, { test1: null })).toStrictEqual({
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
		expect(callWithParsedRules(getRawNodes, rawRules)).toStrictEqual(rawRules)
	})
	it('Number constant', () => {
		expect(callWithParsedRules(getRawNodes, { test3: 10 })).toStrictEqual({
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
		expect(callWithParsedRules(getRawNodes, rawRules)).toStrictEqual(rawRules)
	})
})

describe('Constant folding optim', () => {
	it('∅ -> ∅', () => {
		expect(callWithParsedRules(constantFolding, {})).toStrictEqual({})
	})
	it('Should remove empty nodes', () => {
		expect(
			constantFoldingWith({
				ruleA: null,
				ruleB: {
					formule: '10 * 10',
				},
			})
		).toStrictEqual({
			ruleB: {
				formule: '10 * 10',
			},
		})
	})
	it('Referenced constant should be replaced - [1 dependency]', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				formule: 'B . C * 3',
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		expect(callWithParsedRules(getRawNodes, rawRules)).toStrictEqual({
			ruleA: {
				titre: 'Rule A',
				formule: '10 * 3',
			},
		})
	})
})
