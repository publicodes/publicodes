import { describe, it, expect, test } from 'bun:test'
import { yaml } from '../compile'

describe('Expressions > opérations avancées', () => {
	test('addition de plusieurs nombres', async () => {
		const { somme } = await yaml`
somme: 27 + 1.1 + 0.9
`
		expect(somme.evaluate()).toBe(29)
	})

	test('addition et produit - ordre des opérations', async () => {
		const { calcul } = await yaml`
calcul: 27 + 1 * 2
`
		expect(calcul.evaluate()).toBe(29)
	})

	test('parenthèses', async () => {
		const { calcul } = await yaml`
calcul: 14.5 * (6 - 4)
`
		expect(calcul.evaluate()).toBe(29)
	})

	test('parenthèses avec espaces', async () => {
		const { calcul } = await yaml`
calcul: 14.5 * ( 6 - 4 )
`
		expect(calcul.evaluate()).toBe(29)
	})

	test('nombres négatifs', async () => {
		const { produit } = await yaml`
produit: -5 * -10
`
		expect(produit.evaluate()).toBe(50)
	})

	test("négation d'expressions", async () => {
		const { calcul } = await yaml`
calcul: -(10 - 5)
`
		expect(calcul.evaluate()).toBe(-5)
	})

	test('variables négatives dans expression', async () => {
		const { calcul } = await yaml`
salaire de base:
  unité: €

calcul: 10% * (- salaire de base)
`
		expect(calcul.evaluate({ 'salaire de base': 3000 })).toBe(-300)
		expect(calcul.unit).toBe('€')
	})

	test('puissance précède multiplication', async () => {
		const { calcul } = await yaml`
calcul: 2 ** 2 * 2
`
		expect(calcul.evaluate()).toBe(8)
	})

	test('multiplication précède puissance', async () => {
		const { calcul } = await yaml`
calcul: 3 * 2 ** 2
`
		expect(calcul.evaluate()).toBe(12)
	})

	test('multiplication précède puissance avec parenthèses', async () => {
		const { calcul } = await yaml`
calcul: (3 * 2) ** 2
`
		expect(calcul.evaluate()).toBe(36)
	})

	// @TODO - addition of percentage
	it.skip('intérêts composés', async () => {
		const { calcul } = await yaml`
calcul: 100 * ( 1 + 2% ) ** 3
`
		expect(calcul.evaluate()).toBe(106.12)
	})

	it.skip('division entière', async () => {
		const { calcul } = await yaml`
calcul: 11 // 4
`
		expect(calcul.evaluate()).toBe(2)
	})
})
