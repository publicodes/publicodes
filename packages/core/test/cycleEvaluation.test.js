import Engine from '../src/index'

import { describe, expect, test } from 'vitest'

describe('cycle evaluation', () => {
	test('cycle evaluation should be idempotent', () => {
		const rules = {
			rule1: { 'par défaut': 4, somme: ['rule2', 2] },
			rule2: { somme: ['rule1', 3] },
		}
		const engine = new Engine(rules)
		engine.setSituation({})

		engine.evaluate('rule1')
		const firstEvaluation = engine.evaluate('rule2')
		engine.setSituation({})
		const secondEvaluation = engine.evaluate('rule2')

		expect(secondEvaluation.nodeValue).toEqual(firstEvaluation.nodeValue)
	})

	test('cycle evaluation should be idempotent 2', () => {
		const rules = {
			'a . c': { somme: ['a', 2] },
			a: { 'par défaut': 3, valeur: 'a . c' },
		}
		const engine = new Engine(rules)
		const firstValue = engine.evaluate('a . c').nodeValue

		engine.setSituation({})
		engine.evaluate('a')
		expect(engine.evaluate('a . c').nodeValue).toEqual(firstValue)
	})

	test('idempotence when two cycles are intertwined', () => {
		const rules = {
			a: { somme: ['c', 'b'] },
			'a . b': { 'par défaut': 3, valeur: 'a' },
			'a . c': { 'par défaut': 2, valeur: 'a' },
		}
		const engine = new Engine(rules)
		const firstValue = engine.evaluate('a').nodeValue
		engine.setSituation({})
		engine.evaluate('a . c')
		expect(engine.evaluate('a').nodeValue).toEqual(firstValue)
		engine.setSituation({})
		engine.evaluate('a . b')
		expect(engine.evaluate('a').nodeValue).toEqual(firstValue)
	})

	test('idempotence when two cycles are intertwined 2', () => {
		const rules = {
			'a . c': { somme: ['a', 'b'] },
			a: { 'par défaut': 3, valeur: 'a . c' },
			b: { 'par défaut': 2, valeur: 'a . c' },
		}
		const engine = new Engine(rules)
		const firstValue = engine.evaluate('a . c').nodeValue
		engine.setSituation({})
		engine.evaluate('a')
		expect(engine.evaluate('a . c').nodeValue).toEqual(firstValue)
		engine.setSituation({})
		engine.evaluate('b')
		expect(engine.evaluate('a . c').nodeValue).toEqual(firstValue)
	})
})
