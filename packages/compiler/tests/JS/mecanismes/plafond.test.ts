import { TestPublicodes, yaml } from '../compile'

describe('Mécanisme > plafond', () => {
	let engine: TestPublicodes

	beforeAll(async () => {
		engine = await yaml`
test:
  plafond: plafond
  valeur: 10
plafond:
`
	})
	test.each([
		['inférieur (applicable)', { plafond: 5 }, { value: 5, missing: [] }],
		['supérieur (non applicable)', { plafond: 15 }, { value: 10, missing: [] }],
		['non défini', {}, { value: undefined, missing: ['plafond'] }],
		['non applicable', { plafond: null }, { value: 10, missing: [] }],
	])('%s', (_, context, expected) => {
		expect(engine.test.evaluateParams(context)).toMatchObject(expected)
	})

	test("s'applique au contexte", async () => {
		const engine = await yaml`
test:
  plafond: 10
`
		expect(engine.test.evaluate({ test: 15 })).toBe(10)
	})
})
