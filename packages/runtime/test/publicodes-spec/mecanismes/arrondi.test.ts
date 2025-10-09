import { describe, test, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../../utils/compile'

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
		test("arrondi à l'unité", () => {
			const result = engine.evaluate("arrondi à l'unité")
			expect(result.value).toEqual(33)
		})

		test('arrondi à 2 décimales', () => {
			const result = engine.evaluate('arrondi à 2 décimales')
			expect(result.value).toEqual(33.42)
		})

		test('arrondi à la dizaine', () => {
			const result = engine.evaluate('arrondi à la dizaine')
			expect(result.value).toEqual(30)
		})

		test('arrondi à 0.5 près', () => {
			const result = engine.evaluate('arrondi à 0.5 près')
			expect(result.value).toEqual(33.5)
		})
	})

	describe('arrondi avec valeur dynamique en décimales', () => {
		let engine: TestPublicodes

		beforeAll(async () => {
			engine = await yaml`
a:
  valeur: 12.458 %
  arrondi: b

b:
  unité: décimales
`
		})

		test('arrondi à 0 décimales', () => {
			expect(engine.evaluate('a', { b: 0 }).value).toEqual(12)
		})

		test('arrondi à 5 décimales', () => {
			expect(engine.evaluate('a', { b: 5 }).value).toEqual(12.458)
			expect(engine.getType('a').unit).toBe('%')
		})

		test('arrondi à -1 décimales', () => {
			expect(engine.evaluate('a', { b: -1 }).value).toEqual(10)
		})
	})

	describe('arrondi avec valeur dynamique sans unité', () => {
		let engine: TestPublicodes
		beforeAll(async () => {
			engine = await yaml`
a:
  valeur: 13.458 %
  arrondi: b

b:
  type: nombre

`
		})

		test('arrondi à 0 (erreur)', () => {
			expect(() => engine.evaluate('a', { b: 0 })).toThrowError(
				'Rounding error',
			)
		})

		test('arrondi à 5 près', () => {
			expect(engine.evaluate('a', { b: 5 }).value).toEqual(15)
		})

		test('arrondi à 10 près', () => {
			expect(engine.evaluate('a', { b: 10 }).value).toEqual(10)
		})

		test('arrondi à 0.005 près', () => {
			expect(engine.evaluate('a', { b: 0.005 }).value).toEqual(13.46)
		})
	})

	describe('cas spéciaux', () => {
		test('arrondi avec beaucoup de précision', async () => {
			const engine = await yaml`
a:
  valeur: 35.465729905
  arrondi: 15 décimales

`
			expect(engine.evaluate('a').value).toBe(35.465729905)
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
				engine.evaluate("arrondi d'une valeur non applicable").value,
			).toBeNull()

			expect(engine.evaluate('arrondi non applicable').value).toEqual(13.45)
		})

		test('non défini', async () => {
			const engine = await yaml`
test arrondi:
  arrondi: oui
`
			const result = engine.evaluate('test arrondi')
			expect(result.value).toBeUndefined()
		})
	})

	test.skip("arrondi avec conversion d'unités", async () => {
		const engine = await yaml`
montant:
  valeur: 12.5 €/mois
  unité: €/an
  arrondi: oui
`
		const result = engine.evaluate('montant')
		expect(result.value).toEqual(150)
		// expect(result.unit).toBe('€/an')
	})
})
