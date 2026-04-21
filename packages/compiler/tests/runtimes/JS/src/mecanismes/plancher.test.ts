import { p, TestPublicodes, yaml, value } from '../compile'

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
		['inférieur (non applicable)', { plancher: 5 }, { value: 10, missing: [] }],
		['supérieur (applicable)', { plancher: 15 }, { value: 15, missing: [] }],
		['non défini', {}, { value: p.NotDefined, missing: ['plancher'] }],
		[
			'non applicable',
			{ plancher: p.NotApplicable },
			{ value: 10, missing: [] },
		],
	])('%s', (_, context, expected) => {
		expect(engine.test.evaluate(context)).toMatchObject(expected)
	})

	test("s'applique au contexte", async () => {
		const engine = await yaml`
test:
  plancher: 10
`
		expect(value(engine.test.evaluate({ test: 5 }))).toBe(10)
	})
})
