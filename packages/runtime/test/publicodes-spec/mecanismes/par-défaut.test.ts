import { describe, test, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Mécanisme > par défaut', () => {
	test('simple nombre', async () => {
		const engine = await yaml`
test:
  par défaut: 10
`
		expect(engine.evaluate('test').value).toEqual(10)
	})

	test('simple texte', async () => {
		const engine = await yaml`
test:
  par défaut: "calinou"
`
		expect(engine.evaluate('test').value).toEqual('calinou')
	})

	test('texte vide', async () => {
		const engine = await yaml`
test:
  par défaut: ""
`
		expect(engine.evaluate('test').value).toEqual('')
	})

	test('avec une reference', async () => {
		const engine = await yaml`
a: 5
test:
  par défaut: a
`
		expect(engine.evaluate('test').value).toEqual(5)
	})

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
