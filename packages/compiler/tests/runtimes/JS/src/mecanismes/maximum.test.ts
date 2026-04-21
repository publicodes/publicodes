import { describe, it, expect } from 'bun:test'
import { p, yaml, value } from '../compile'

describe('Mécanisme > le maximum de', () => {
	it('simple', async () => {
		const { a } = await yaml`
a:
  le maximum de:
    - 10
    - 4.4
    - -5
`
		expect(value(a.evaluate())).toBe(10)
	})

	it('une seule valeur', async () => {
		const { a } = await yaml`
a:
  le maximum de:
    - -10
`
		expect(value(a.evaluate())).toBe(-10)
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
		expect(p.isNotDefined(value(a.evaluate()))).toBeTrue()
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
		expect(value(a.evaluate())).toBe(10)
	})
})
