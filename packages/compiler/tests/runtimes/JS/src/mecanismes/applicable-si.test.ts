import { beforeAll, describe, expect, test } from 'bun:test'
import { p, TestPublicodes, yaml } from '../compile'

describe('Mécanisme > applicable si', () => {
	let engine: TestPublicodes

	beforeAll(async () => {
		engine = await yaml`
test:
  applicable si: condition
  valeur: 10
condition:
`
	})

	test.each([
		['condition vrai', { condition: true }, 10],
		['condition fausse', { condition: false }, p.NotApplicable],
		['condition non définie', {}, p.NotApplicable],
	])('%s', (_, context, expected) => {
		expect(engine.test.evaluate(context)).toEqual(expected)
	})

	test('missing parameters', () => {
		expect(engine.test.evaluateParams({ condition: false }).missing).toEqual([])
		expect(engine.test.evaluateParams({}).missing).toEqual(['condition'])
	})

	test('condition non applicable', async () => {
		const { a } = await yaml`
a:
  applicable si: condition
  valeur: 10

condition:
  applicable si: non
`
		expect(p.isNotApplicable(a.evaluate())).toBeTrue()
	})

	test("s'applique au contexte", async () => {
		const engine = await yaml`
test:
  applicable si: non
condition:
`
		expect(p.isNotApplicable(engine.test.evaluate({ test: 10 }))).toBeTrue()
	})
})
