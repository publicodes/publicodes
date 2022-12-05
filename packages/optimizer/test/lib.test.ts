import { constantFolding, getRawNodes } from '../src/lib'
import Engine from 'publicodes'

import type { ParsedRules, RawRules, RuleName } from '../src/lib'

function callWithEngine<R>(fn: (engine) => R, rawRules: RawRules): R {
	const engine = new Engine(rawRules)
	return fn(engine)
}

function callWithParsedRules<R>(
	fn: (rules: ParsedRules) => R,
	rawRules: RawRules
): R {
	const engine = new Engine(rawRules)
	return fn(engine.getParsedRules())
}

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

function constantFoldingWith(rawRules: RawRules): RawRules {
	const res = callWithEngine(constantFolding, rawRules)
	return getRawNodes(res)
}

describe('Constant folding optim', () => {
	it('∅ -> ∅', () => {
		expect(constantFoldingWith({})).toStrictEqual({})
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
				valeur: 100,
				'est compressée': true,
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
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			ruleA: {
				titre: 'Rule A',
				valeur: 30,
				'est compressée': true,
			},
		})
	})
	it('Referenced constant should be replaced - [2 dependency]', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				formule: 'B . C * D',
			},
			'ruleA . B . C': {
				valeur: '10',
			},
			'ruleA . D': {
				valeur: '3',
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			ruleA: {
				titre: 'Rule A',
				valeur: 30,
				'est compressée': true,
			},
		})
	})
	it('Partially compressible rule', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				formule: 'B . C * D',
			},
			'ruleA . D': {
				question: "What's the value of D",
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			ruleA: {
				titre: 'Rule A',
				formule: '10 * D',
				'est compressée': true,
			},
			'ruleA . D': {
				question: "What's the value of D",
			},
		})
	})
	it('Partially compressible rule with constant with mutliple dependencies', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				formule: 'B . C * D',
			},
			ruleB: {
				formule: 'ruleA . B . C * 3',
			},
			'ruleA . D': {
				question: "What's the value of D?",
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			ruleA: {
				titre: 'Rule A',
				formule: '10 * D',
				'est compressée': true,
			},
			ruleB: {
				valeur: 30,
				'est compressée': true,
			},
			'ruleA . D': {
				question: "What's the value of D?",
			},
		})
	})
	it('A is a constant within two degrees', () => {
		const rawRules = {
			A: {
				formule: 'B',
			},
			'A . B': {
				formule: 'C * 10',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			A: {
				valeur: 70,
				'est compressée': true,
			},
		})
	})
	it('A is a constant within two degrees plus B is a partially foldable rule', () => {
		const rawRules = {
			A: {
				formule: 'B',
			},
			B: {
				formule: 'A . B * D',
			},
			'B . D': {
				question: "What's the value of B . D?",
			},
			'A . B': {
				formule: 'C * 10',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			A: {
				valeur: 70,
				'est compressée': true,
			},
			B: {
				formule: '70 * D',
				'est compressée': true,
			},
			'B . D': {
				question: "What's the value of B . D?",
			},
		})
	})
})
