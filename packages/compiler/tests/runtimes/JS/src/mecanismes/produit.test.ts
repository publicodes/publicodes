import { describe, expect, test } from 'bun:test'
import { p, yaml } from '../compile'

describe('Mécanisme > produit', () => {
	test('simple', async () => {
		const { a } = await yaml`
a:
  produit:
    - 10
    - 4 kg
    - 5 €/kg
`
		expect(a.evaluate()).toBe(200)
		expect(a.unit).toBe('€')
	})

	test('une seule valeur', async () => {
		const { a } = await yaml`
a:
  produit:
    - -10
`
		expect(a.evaluate()).toBe(-10)
	})

	test('valeur non définie', async () => {
		const { a } = await yaml`
a:
  produit:
    - b
    - 10
b:
`
		expect(p.isNotDefined(a.evaluate())).toBeTrue()
	})

	test('valeur non applicable', async () => {
		const { a } = await yaml`
a:
  produit:
    - 10 %
    - salaire brut
salaire brut:
  non applicable si: oui
`
		expect(p.isNotApplicable(a.evaluate())).toBeTrue()
	})
})
