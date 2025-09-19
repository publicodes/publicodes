import { describe, it, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../../utils/compile'

describe('Mécanisme > arrondi au supérieur', async () => {
	let engine: TestPublicodes
	beforeAll(async () => {
		engine = await yaml`
à l'unité:
  valeur: 38.4167
  arrondi au supérieur: oui

à 2 décimales:
  valeur: 38.4167
  arrondi au supérieur: 2 décimales

à la dizaine:
  valeur: 38.4167
  arrondi au supérieur: 10

à 0.05 près:
  valeur: 38.4167
  arrondi au supérieur: 0.05

à 5 décimales:
  valeur: 38.4167
  arrondi au supérieur: 5 décimales
`
	})
	it("à l'unité", async () => {
		const result = engine.evaluate("à l'unité")
		expect(result.value).toBe(39)
	})

	it('à 2 décimales', async () => {
		const result = engine.evaluate('à 2 décimales')
		expect(result.value).toBe(38.42)
	})

	it('à la dizaine', async () => {
		const result = engine.evaluate('à la dizaine')
		expect(result.value).toBe(40)
	})

	it('à 0.5 près', async () => {
		const result = engine.evaluate('à 0.05 près')
		expect(result.value).toBe(38.45)
	})

	it('à 5 décimales', async () => {
		const result = engine.evaluate('à 5 décimales')
		expect(result.value).toBe(38.4167)
	})
})
