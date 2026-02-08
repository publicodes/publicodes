import { describe, test, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../compile'

describe('Mécanisme > arrondi', () => {
	describe('arrondi simple', () => {
		let engine: TestPublicodes
		beforeAll(async () => {
			engine = await yaml`
arrondi à l'unité:
  valeur: 33.4167
  arrondi: oui

arrondi à 2 décimales:
  valeur: 33.4167
  arrondi: 2 décimales

arrondi à la dizaine:
  valeur: 33.4167
  arrondi: 10

arrondi à 0.5 près:
  valeur: 33.4167
  arrondi: 0.5
`
		})

		test.each([
			["arrondi à l'unité", 33],
			['arrondi à 2 décimales', 33.42],
			['arrondi à la dizaine', 30],
			['arrondi à 0.5 près', 33.5],
		])('%s', (name, expected) => {
			expect(engine[name].evaluate()).toBe(expected)
		})
	})

	describe('arrondi avec valeur dynamique en décimales', () => {
		let a: TestPublicodes[string]

		beforeAll(async () => {
			a = (
				await yaml`
a:
  valeur: 12.458 %
  arrondi: b

b:
  unité: décimales
`
			).a
		})

		test('arrondi à 0 décimales', () => {
			expect(a.evaluate({ b: 0 })).toBe(12)
		})

		test('arrondi à 5 décimales', () => {
			expect(a.evaluate({ b: 5 })).toBe(12.458)
			expect(a.unit).toBe('%')
		})

		test('arrondi à -1 décimales', () => {
			expect(a.evaluate({ b: -1 })).toBe(10)
		})
	})

	describe('arrondi avec valeur dynamique sans unité', () => {
		let rules: TestPublicodes
		beforeAll(async () => {
			rules = await yaml`
a:
  valeur: 13.458 %
  arrondi: b

b:
  type: nombre

`
		})

		test('arrondi à 0 (erreur)', () => {
			expect(() => rules.a.evaluate({ b: 0 })).toThrowError('Rounding error')
		})

		test('arrondi à 5 près', () => {
			expect(rules.a.evaluate({ b: 5 })).toBe(15)
		})

		test('arrondi à 10 près', () => {
			expect(rules.a.evaluate({ b: 10 })).toBe(10)
		})

		test('arrondi à 0.005 près', () => {
			expect(rules.a.evaluate({ b: 0.005 })).toBe(13.46)
		})
	})

	describe('cas spéciaux', () => {
		test('arrondi avec beaucoup de précision', async () => {
			const rules = await yaml`
a:
  valeur: 35.465729905
  arrondi: 15 décimales

`
			expect(rules.a.evaluate()).toBe(35.465729905)
		})

		test('sans unité (erreur)', () => {
			expect(yaml`
a:
  arrondi: b
b:
`).rejects.toThrowError('type invalide détécté')
		})

		test('non applicable', async () => {
			const engine = await yaml`
règle non applicable:
  applicable si: non

arrondi d'une valeur non applicable:
  valeur: règle non applicable
  arrondi: oui

arrondi non applicable:
  valeur: 13.45
  arrondi: règle non applicable
`
			expect(
				engine["arrondi d'une valeur non applicable"].evaluate(),
			).toBeNull()

			expect(engine['arrondi non applicable'].evaluate()).toBe(13.45)
		})

		test('non défini', async () => {
			const engine = await yaml`
test arrondi:
  arrondi: oui
`
			const result = engine['test arrondi'].evaluate()
			expect(result).toBeUndefined()
		})
	})

	test.skip("arrondi avec conversion d'unités", async () => {
		const { montant } = await yaml`
montant:
  valeur: 12.5 €/mois
  unité: €/an
  arrondi: oui
`

		expect(montant.evaluate()).toBe(150)
	})

	test("s'applique au contexte", async () => {
		const { a } = await yaml`
a:
  arrondi: oui
`

		expect(a.evaluate({ a: 1.4 })).toBe(1)
	})
})
