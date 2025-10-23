import { TestPublicodes, yaml } from '../../utils/compile'

describe('Mécanisme > plancher', () => {
	let engine: TestPublicodes

	beforeAll(async () => {
		engine = await yaml`
test:
  plancher: plancher
  valeur: 10
plancher:
`
	})

	test.each([
		[
			'inférieur (non applicable)',
			{ plancher: 5 },
			{ value: 5, missingParameters: [] },
		],
		[
			'supérieur (applicable)',
			{ plancher: 15 },
			{ value: 15, missingParameters: [] },
		],
		['non défini', {}, { value: undefined, missingParameters: ['plancher'] }],
		[
			'non applicable',
			{ plancher: null },
			{ value: 10, missingParameters: [] },
		],
	])('%s', (_, context, expected) => {
		expect(engine.evaluate('test', context)).toMatchObject(expected)
	})

	test("s'applique au contexte", async () => {
		const engine = await yaml`
test:
  plancher: 10
`
		expect(engine.evaluate('test', { test: 5 }).value).toBe(10)
	})
})
