import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Expressions > opérations avancées', () => {
	it('addition de plusieurs nombres', async () => {
		const engine = await yaml`
somme: 27 + 1.1 + 0.9
`
		expect(engine.evaluate('somme').value).toEqual(29)
	})

	it('addition et produit - ordre des opérations', async () => {
		const engine = await yaml`
calcul: 27 + 1 * 2
`
		expect(engine.evaluate('calcul').value).toEqual(29)
	})

	it('parenthèses', async () => {
		const engine = await yaml`
calcul: 14.5 * (6 - 4)
`
		expect(engine.evaluate('calcul').value).toEqual(29)
	})

	it('parenthèses avec espaces', async () => {
		const engine = await yaml`
calcul: 14.5 * ( 6 - 4 )
`
		expect(engine.evaluate('calcul').value).toEqual(29)
	})

	it('nombres négatifs', async () => {
		const engine = await yaml`
produit: -5 * -10
`
		expect(engine.evaluate('produit').value).toEqual(50)
	})

	it("négation d'expressions", async () => {
		const engine = await yaml`
calcul: -(10 - 5)
`
		expect(engine.evaluate('calcul').value).toEqual(-5)
	})

	it('variables négatives dans expression', async () => {
		const engine = await yaml`
salaire de base:
  unité: €

calcul: 10% * (- salaire de base)
`
		expect(
			engine.evaluate('calcul', { 'salaire de base': 3000 }).value,
		).toEqual(-300)
		expect(engine.outputs['calcul'].type.unit).toBe('€')
	})

	it('puissance précède multiplication', async () => {
		const engine = await yaml`
calcul: 2 ** 2 * 2
`
		expect(engine.evaluate('calcul').value).toEqual(8)
	})

	it('multiplication précède puissance', async () => {
		const engine = await yaml`
calcul: 3 * 2 ** 2
`
		expect(engine.evaluate('calcul').value).toEqual(12)
	})

	it('multiplication précède puissance avec parenthèses', async () => {
		const engine = await yaml`
calcul: (3 * 2) ** 2
`
		expect(engine.evaluate('calcul').value).toEqual(36)
	})

	// @TODO
	it.skip('intérêts composés', async () => {
		const engine = await yaml`
calcul: 100 * ( 1 + 2% ) ** 3
`
		expect(engine.evaluate('calcul').value).toBe(106.12)
	})

	it.skip('division entière', async () => {
		const engine = await yaml`
calcul: 11 // 4
`
		expect(engine.evaluate('calcul').value).toEqual(2)
	})
})
