import { beforeAll, describe, expect, test } from 'bun:test'
import { TestPublicodes, yaml } from '../../utils/compile'

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
		[
			'condition vrai',
			{ condition: true },
			{ value: 10, missingParameters: [] },
		],
		[
			'condition fausse',
			{ condition: false },
			{ value: null, missingParameters: [] },
		],
		[
			'condition non définie',
			{},
			{ value: null, missingParameters: ['condition'] },
		],
	])('%s', (_, context, expected, done) => {
		expect(engine.test.evaluate(context)).toBe(expected.value)
		expect(engine.test.evaluateParams(context).missing).toEqual(
			expected.missingParameters,
		)
		done()
	})

	test('condition non applicable', async () => {
		const { a } = await yaml`
a:
  applicable si: condition
  valeur: 10

condition:
  applicable si: non
`
		expect(a.evaluate()).toBe(null)
	})

	test("s'applique au contexte", async () => {
		const engine = await yaml`
test:
  applicable si: non
condition:
`
		expect(engine.test.evaluate({ test: 10 })).toBe(null)
	})
})
