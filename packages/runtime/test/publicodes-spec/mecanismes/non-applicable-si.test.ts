import { TestPublicodes, yaml } from '../../utils/compile'

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
		['condition applicable', { condition: true }, { value: null, missing: [] }],
		[
			'condition non-applicable',
			{ condition: false },
			{ value: 10, missing: [] },
		],
		[
			'applicable si condition non définie',
			{},
			{ value: 10, missing: ['condition'] },
		],
	])('%s', (_, context, expected) => {
		expect(rules.test.evaluateParams(context)).toMatchObject(expected)
	})

	test("s'applique au contexte", async () => {
		const { a } = await yaml`
a:
  non applicable si: oui
condition:
`
		expect(a.evaluate({ a: 10 })).toBe(null)
	})
})
