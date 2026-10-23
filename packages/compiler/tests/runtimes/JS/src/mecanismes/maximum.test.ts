import { describe, it, expect } from 'bun:test'
import { p, yaml } from '../compile'

describe('Mécanisme > le maximum de', () => {
	it('simple', async () => {
		const { a } = await yaml`
a:
  le maximum de:
    - 10
    - 4.4
    - -5
`
		expect(a.evaluate().value).toBe(10)
	})

	it('une seule valeur', async () => {
		const { a } = await yaml`
a:
  le maximum de:
    - -10
`
		expect(a.evaluate().value).toBe(-10)
	})

	it('valeur non définie', async () => {
		const { a, b } = await yaml`
a:
  le maximum de:
    - 10 €
    - 4.4
    - b
b:
`
		expect(a.evaluate()).toEqual({
			value: p.NotDefined,
			missing: ['b'],
			needed: ['b'],
			trace: {},
		})
		expect(b.unit).toBe('€')
	})

	it('valeur non applicable', async () => {
		const { a } = await yaml`
a:
  le maximum de:
    - 10 %
    - 4.4
    - b
b:
  non applicable si: oui
`
		expect(a.evaluate().value).toBe(10)
	})

	it('toutes les valeurs sont non applicables', async () => {
		const { a } = await yaml`
a:
  le maximum de:
    - b
    - c
b:
  non applicable si: oui

c:
  non applicable si: oui
`
		expect(p.isNotApplicable(a.evaluate().value)).toBeTrue()
	})
})
