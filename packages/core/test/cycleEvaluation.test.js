import Engine from '../src/index'

import { describe, expect, test } from 'vitest'

describe('cycle evaluation', () => {
	test('cycle evaluation should be idempotent', () => {
		const rules = {
			rule1: { 'par défaut': 4, somme: ['rule2', 2] },
			rule2: { somme: ['rule1', 3] },
		}
		const engine = new Engine(rules)

		engine.evaluate('rule1')
		const firstEvaluation = engine.evaluate('rule2')
		engine.setSituation({})
		const secondEvaluation = engine.evaluate('rule2')

		expect(secondEvaluation.nodeValue).toEqual(firstEvaluation.nodeValue)
	})
})
