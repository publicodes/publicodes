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
		['applicable', { condition: true }, { value: 10, missingParameters: [] }],
		[
			'non-applicable',
			{ condition: false },
			{ value: null, missingParameters: [] },
		],
		[
			'non applicable si condition non définie',
			{},
			{ value: null, missingParameters: ['condition'] },
		],
	])('%s', (_, context, expected) => {
		expect(engine.test.evaluate(context)).toBe(expected.value)
		expect(engine.test.evaluateParams(context).missing).toEqual(
			expected.missingParameters,
		)
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
