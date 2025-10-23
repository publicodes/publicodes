import { describe, test, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../../utils/compile'

describe('Mécanisme > arrondi au supérieur', () => {
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

	test.each([
		["à l'unité", 39],
		['à 2 décimales', 38.42],
		['à la dizaine', 40],
		['à 0.05 près', 38.45],
		['à 5 décimales', 38.4167],
	])('%s', (name, expected) => {
		expect(engine[name].evaluate()).toBe(expected)
	})

	test("s'applique au contexte", async () => {
		const { a } = await yaml`
a:
  arrondi au supérieur: oui
`
		expect(a.evaluate({ a: 1.4 })).toEqual(2)
	})
})
