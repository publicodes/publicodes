import { TestPublicodes, yaml } from '../../utils/compile'

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
		[
			'inférieur (applicable)',
			{ plafond: 5 },
			{ value: 5, missingParameters: [] },
		],
		[
			'supérieur (non applicable)',
			{ plafond: 15 },
			{ value: 10, missingParameters: [] },
		],
		['non défini', {}, { value: undefined, missingParameters: ['plafond'] }],
		['non applicable', { plafond: null }, { value: 10, missingParameters: [] }],
	])('%s', (_, context, expected) => {
		expect(engine.evaluate('test', context)).toMatchObject(expected)
	})

	test("s'applique au contexte", async () => {
		const engine = await yaml`
test:
  plafond: 10
`
		expect(engine.evaluate('test', { test: 15 }).value).toBe(10)
	})
})
