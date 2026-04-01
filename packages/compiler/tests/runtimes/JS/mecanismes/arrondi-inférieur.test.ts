import { describe, test, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../compile'

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

	test.each([
		["à l'unité", 38],
		['à 2 décimales', 38.41],
		['à la dizaine', 30],
		['à 0.5 près', 38.0],
		['à 5 décimales', 38.4167],
	])('%s', (name, expected) => {
		expect(engine[name].evaluate()).toBe(expected)
	})

	test("s'applique au contexte", async () => {
		const { a } = await yaml`
a:
  arrondi à l'inférieur: oui
`
		expect(a.evaluate({ a: 1.7 })).toEqual(1)
	})
})
