import { describe, test, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Mécanisme > par défaut', () => {
	test.each([
		['simple nombre', 10],
		['simple texte', "'calinou'"],
		['texte vide', "''"],
	])('%s', async (_, defaultValue) => {
		const engine = await yaml`
test:
  par défaut: ${defaultValue}
`
		expect(engine.evaluate('test').value).toEqual(defaultValue)
	})

	test('avec une valeur', async () => {
		const engine = await yaml`
a:
b:
test:
  par défaut: a
  valeur: b
`
		expect(engine.evaluate('test')).toMatchObject({
			value: undefined,
			missingParameters: ['b', 'a'],
		})

		expect(engine.evaluate('test', { a: 5 })).toMatchObject({
			value: 5,
			missingParameters: ['b'],
		})

		expect(engine.evaluate('test', { b: 5 })).toMatchObject({
			value: 5,
			missingParameters: [],
		})
	})

	test('avec le contexte', async () => {
		const engine = await yaml`
a:
test:
  par défaut: a
`
		expect(engine.evaluate('test')).toMatchObject({
			value: undefined,
			missingParameters: ['test', 'a'],
		})

		expect(engine.evaluate('test', { a: 5 })).toMatchObject({
			value: 5,
			missingParameters: ['test'],
		})

		expect(engine.evaluate('test', { test: 5 })).toMatchObject({
			value: 5,
			missingParameters: [],
		})
	})

	// TODO move this to cram test
	test('avec une valeur différente du type attendu', async () => {
		try {
			await yaml`
test:
  type: nombre
  par défaut: "calinou"
`
		} catch (e) {
			expect(e).toBeInstanceOf(Error)
			expect((e as Error).message).toMatch(/types non cohérents entre eux/)
		}
		expect.assertions(2)
	})

	// TODO move this to cram test
	test('valeur manquante', async () => {
		try {
			await yaml`
test:
  par défaut:
`
		} catch (e) {
			expect(e).toBeInstanceOf(Error)
			expect((e as Error).message).toMatch(/valeur manquante/)
		}
		expect.assertions(2)
	})
})
