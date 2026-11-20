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

	it('addition et soustraction de pourcentages', async () => {
		const { a, c } = await yaml`
    a: 100% - 40%
    c: 40% + 5%
    `
		expect(a.evaluate().value).toEqual(60)
		expect(a.unit).toBe('%')
		expect(c.evaluate().value).toEqual(45)
		expect(c.unit).toBe('%')
	})

	it('pourcentage et valeur sans unité sont incompatibles', () => {
		expect(yaml`
a: 100% - 1
`).rejects.toThrowError('unités non compatibles')
		expect(yaml`
b: 1 - 40%
`).rejects.toThrowError('unités non compatibles')
		expect(yaml`
c: 50% + 1
`).rejects.toThrowError('unités non compatibles')
	})

	it('mélange de pourcentages et de valeurs sans unité dans une liste', async () => {
		const { somme, moyenne, minimum, maximum } = await yaml`
    somme:
      somme:
        - 40%
        - 5%

    moyenne:
      moyenne:
        - 40%
        - 5%

    minimum:
      le minimum de:
        - 40%
        - 5%

    maximum:
      le maximum de:
        - 40%
        - 5%
    `
		expect(somme.evaluate().value).toEqual(45)
		expect(somme.unit).toBe('%')
		expect(moyenne.evaluate().value).toEqual(22.5)
		expect(moyenne.unit).toBe('%')
		expect(minimum.evaluate().value).toEqual(5)
		expect(minimum.unit).toBe('%')
		expect(maximum.evaluate().value).toEqual(40)
		expect(maximum.unit).toBe('%')
	})

	it('mélange de pourcentages et de valeurs sans unité dans une liste (erreur)', () => {
		expect(yaml`
a:
  somme:
    - 100%
    - 1
`).rejects.toThrowError('unités non compatibles')
		expect(yaml`
b:
  moyenne:
    - 40%
    - 1
`).rejects.toThrowError('unités non compatibles')
		expect(yaml`
c:
  le minimum de:
    - 40%
    - 1
`).rejects.toThrowError('unités non compatibles')
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
    d: 20 * 5% #1
    `
		expect(a.evaluate().value).toEqual(25)
		expect(a.unit).toBe('W')
		expect(b.evaluate().value).toEqual(50)
		expect(b.unit).toBe('%')
		expect(c.evaluate().value).toEqual(20)
		expect(c.unit).toBe('kg')
		expect(d.evaluate().value).toEqual(1)
		expect(d.unit).toBe('aucune')
	})

	it('simplification dans les multiplications - 3', async () => {
		const { a, e, f, h } = await yaml`
    a: 5% * 200 # 10
    e: 50% * 20% # 10%
    f: 50% * 50% * 20% # 5%
    h: 50% * 20% * 10 # 1
    `
		expect(a.evaluate().value).toEqual(10)
		expect(a.unit).toBe('aucune')
		expect(e.evaluate().value).toEqual(10)
		expect(e.unit).toBe('%')
		expect(f.evaluate().value).toEqual(5)
		expect(f.unit).toBe('%')
		expect(h.evaluate().value).toEqual(1)
		expect(h.unit).toBe('aucune')
	})

	it('simplify over exception', async () => {
		const { c } = await yaml`
    a: 20 %
    b:
      remplace: a
      valeur: 10%
    c: 100€ * a

    `
		expect(c.evaluate().value).toEqual(10)
		expect(c.unit).toBe('€')
	})

	it('simplify over product', async () => {
		const { a } = await yaml`
    a:
      produit:
        - 10€
        - 10%
    `
		expect(a.evaluate().value).toEqual(1)
		expect(a.unit).toBe('€')
	})

	it('le mécanisme produit se comporte comme la multiplication', async () => {
		const { a, b, c, d } = await yaml`
    a:
      produit:
        - 5%
        - 200
    b:
      produit:
        - 20
        - 5%
    c:
      produit:
        - 50%
        - 20%
    d:
      produit:
        - 50%
        - 50%
        - 20%
    `
		expect(a.evaluate().value).toEqual(10)
		expect(a.unit).toBe('aucune')
		expect(b.evaluate().value).toEqual(1)
		expect(b.unit).toBe('aucune')
		expect(c.evaluate().value).toEqual(10)
		expect(c.unit).toBe('%')
		expect(d.evaluate().value).toEqual(5)
		expect(d.unit).toBe('%')
	})
})
