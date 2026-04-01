import { describe, test, expect } from 'bun:test'
import { yaml } from '../compile'

describe('Mécanisme > par défaut', () => {
	test('simple nombre', async () => {
		const rules = await yaml`
test:
  par défaut: 10
`
		expect(rules.test.evaluate()).toBe(10)
	})

	test('simple texte vide', async () => {
		const rules = await yaml`
test:
  par défaut: ''
`
		expect(rules.test.evaluate()).toBe('')
	})

	test('avec une valeur', async () => {
		const rules = await yaml`
a:
b:
test:
  par défaut: a
  valeur: b
`
		expect(rules.test.evaluateParams()).toMatchObject({
			value: undefined,
			missing: ['b', 'a'],
		})

		expect(rules.test.evaluateParams({ a: 5 })).toMatchObject({
			value: 5,
			missing: ['b'],
		})

		expect(rules.test.evaluateParams({ b: 5 })).toMatchObject({
			value: 5,
			missing: [],
		})
	})

	test('avec le contexte', async () => {
		const rules = await yaml`
a:
test:
  par défaut: a
`
		expect(rules.test.evaluateParams()).toMatchObject({
			value: undefined,
			missing: ['test', 'a'],
		})

		expect(rules.test.evaluateParams({ a: 5 })).toMatchObject({
			value: 5,
			missing: ['test'],
		})

		expect(rules.test.evaluateParams({ test: 5 })).toMatchObject({
			value: 5,
			missing: [],
		})
	})
})
