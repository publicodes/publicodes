import { describe, test, expect, beforeAll } from 'bun:test'
import { p, TestPublicodes, yaml } from '../compile'

describe('Mécanisme > non applicable si', () => {
	let rules: TestPublicodes

	beforeAll(async () => {
		rules = await yaml`
test:
  non applicable si: condition
  valeur: 10
condition:
`
	})

	test.each([
		[
			'condition vrai',
			{ condition: true },
			{ value: p.NotApplicable, missing: [] },
		],
		['condition fausse', { condition: false }, { value: 10, missing: [] }],
		[
			'applicable si condition non définie',
			{},
			{ value: 10, missing: ['condition'] },
		],
	])('%s', (_, context, expected) => {
		expect(rules.test.evaluate(context)).toMatchObject(expected)
	})

	test('condition non applicable', async () => {
		const { a } = await yaml`
a:
  non applicable si: condition
  valeur: 10

condition:
  applicable si: non
`
		expect(a.evaluate().value).toBe(10)
	})

	test("s'applique au contexte", async () => {
		const { a } = await yaml`
a:
  non applicable si: oui
condition:
`
		expect(p.isNotApplicable(a.evaluate({ a: 10 }).value)).toBeTrue()
	})
})
