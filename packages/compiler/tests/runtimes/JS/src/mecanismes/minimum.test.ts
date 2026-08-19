import { describe, it, expect } from 'bun:test'
import { p, yaml } from '../compile'

describe('Mécanisme > le minimum de', () => {
	it('simple', async () => {
		const { a } = await yaml`
a:
  le minimum de:
    - 10
    - 4.4
    - -5
`
		expect(a.evaluate().value).toBe(-5)
	})

	it('une seule valeur', async () => {
		const { a } = await yaml`
a:
  le minimum de:
    - -10
`
		expect(a.evaluate().value).toBe(-10)
	})

	it('valeur non définie', async () => {
		const { a, b } = await yaml`
a:
  le minimum de:
    - 10 €
    - 4.4
    - b
b:
`
		expect(p.isNotDefined(a.evaluate().value)).toBeTrue()
		expect(b.unit).toBe('€')
	})

	it('valeur non applicable', async () => {
		const { a } = await yaml`
a:
  le minimum de:
    - 10 %
    - 4.4
    - b
b:
  non applicable si: oui
`
		expect(a.evaluate().value).toBe(4.4)
	})
})
