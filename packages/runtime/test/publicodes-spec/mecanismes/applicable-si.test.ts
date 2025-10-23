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
	test('applicable', () => {
		expect(engine.evaluate('test', { condition: true })).toMatchObject({
			value: 10,
			missingParameters: [],
		})
	})
	test('non-applicable', () => {
		expect(engine.evaluate('test', { condition: false })).toMatchObject({
			value: null,
			missingParameters: [],
		})
	})
	test('non applicable si condition non définie', () => {
		expect(engine.evaluate('test')).toMatchObject({
			value: null,
			missingParameters: ['condition'],
		})
	})

	test("s'applique au contexte", async () => {
		const engine = await yaml`
test:
  applicable si: non
condition:
`
		expect(engine.evaluate('test', { test: 10 }).value).toBe(null)
	})
})
