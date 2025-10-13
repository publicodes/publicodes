import { describe, it, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../../utils/compile'

describe("Mécanisme > arrondi à l'inférieur", () => {
	let engine: TestPublicodes
	beforeAll(async () => {
		engine = await yaml`
			à l'unité:
			  valeur: 38.4167
			  arrondi à l'inférieur: oui

			à 2 décimales:
			  valeur: 38.4167
			  arrondi à l'inférieur: 2 décimales

			à la dizaine:
			  valeur: 38.4167
			  arrondi à l'inférieur: 10

			à 0.5 près:
			  valeur: 38.4167
			  arrondi à l'inférieur: 0.5

			à 5 décimales:
			  valeur: 38.4167
			  arrondi à l'inférieur: 5 décimales
		`
	})

	it("à l'unité", () => {
		const result = engine.evaluate("à l'unité")
		expect(result.value).toBe(38)
	})

	it('à 2 décimales', () => {
		const result = engine.evaluate('à 2 décimales')
		expect(result.value).toBe(38.41)
	})

	it('à la dizaine', () => {
		const result = engine.evaluate('à la dizaine')
		expect(result.value).toBe(30)
	})

	it('à 0.5 près', () => {
		const result = engine.evaluate('à 0.5 près')
		expect(result.value).toBe(38.0)
	})

	it('à 5 décimales', () => {
		const result = engine.evaluate('à 5 décimales')
		expect(result.value).toBe(38.4167)
	})
})
