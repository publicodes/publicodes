import { describe, it, expect } from 'bun:test'
import { yaml } from '../compile'

describe('Expressions > pourcentage', () => {
	it('constante', async () => {
		const { constante } = await yaml`

constante:
  valeur: 38.1%
    `
		expect(constante.evaluate().value).toEqual(38.1)
		expect(constante.unit).toBe('%')
	})

	it('soustraction', async () => {
		const { soustraction } = await yaml`
taux:
  unité: '%'

soustraction:
  valeur: 100% - taux
    `
		expect(
			soustraction.evaluate({
				taux: 89,
			}).value,
		).toEqual(11)
		expect(soustraction.unit).toBe('%')
	})

	it('simplification dans les multiplications', async () => {
		const { multiplication } = await yaml`

salaire:
  unité: €
multiplication:  38.1% * salaire
    `
		expect(
			multiplication.evaluate({
				salaire: 1000,
			}).value,
		).toEqual(381)
		expect(multiplication.unit).toBe('€')
	})
	it('inférence  dans les multiplications', async () => {
		const { salaire } = await yaml`

salaire:
multiplication:
  unité: €
  valeur: 38.1% * salaire
`
		expect(salaire.unit).toBe('€')
	})

	it('simplification dans les multiplications - 2', async () => {
		const { a, b, c, d } = await yaml`
    a: 50W / 200% #25W
    b: 10 %/étoiles * 5 étoiles #50%
    c: 40 kg * 50% #20kg
    d: 20 * 5% #100%
    `
		expect(a.evaluate().value).toEqual(25)
		expect(a.unit).toBe('W')
		expect(b.evaluate().value).toEqual(50)
		expect(b.unit).toBe('%')
		expect(c.evaluate().value).toEqual(20)
		expect(c.unit).toBe('kg')
		expect(d.evaluate().value).toEqual(100)
		expect(d.unit).toBe('%')
	})
})
