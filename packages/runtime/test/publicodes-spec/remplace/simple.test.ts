import { describe, test, expect, beforeAll } from 'bun:test'
import { yaml, TestPublicodes } from '../../utils/compile'

describe('Remplace > simple', () => {
	let rules: TestPublicodes
	beforeAll(async () => {
		rules = await yaml`
restaurant:
  avec:
    prix du repas: 10 €/repas
    client gourmand:
    menu gourmand:
      applicable si: client gourmand
      remplace: prix du repas
      valeur: 15 €/repas

test: restaurant . prix du repas
`
	})
	test('non applicable', () => {
		expect(rules.test.evaluate({ 'restaurant . client gourmand': false })).toBe(
			10,
		)
	})

	test('applicable', () => {
		expect(rules.test.evaluate({ 'restaurant . client gourmand': true })).toBe(
			15,
		)
	})

	test('condition non définie', () => {
		expect(rules.test.evaluate()).toBe(10)
	})

	test('remplace non défini', async () => {
		const { x } = await yaml`
a:
  remplace: b
b: 1
x: b
`
		expect(x.evaluate()).toBe(undefined)
	})
})
