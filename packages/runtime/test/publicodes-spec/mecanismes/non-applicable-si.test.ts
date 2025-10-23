import { TestPublicodes, yaml } from '../../utils/compile'

describe('Mécanisme > non applicable si', () => {
	let engine: TestPublicodes

	beforeAll(async () => {
		engine = await yaml`
test:
  non applicable si: condition
  valeur: 10
condition:
`
	})
	test.each([
		[
			'condition applicable',
			{ condition: true },
			{ value: null, missingParameters: [] },
		],
		[
			'condition non-applicable',
			{ condition: false },
			{ value: 10, missingParameters: [] },
		],
		[
			'applicable si condition non définie',
			{},
			{ value: 10, missingParameters: ['condition'] },
		],
	])('%s', (_, context, expected) => {
		expect(engine.evaluate('test', context)).toMatchObject(expected)
	})

	test("s'applique au contexte", async () => {
		const engine = await yaml`
test:
  non applicable si: oui
condition:
`
		expect(engine.evaluate('test', { test: 10 }).value).toBe(null)
	})
})
