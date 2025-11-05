import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Mécanisme > le maximum de', () => {
	it('simple', async () => {
		const { a } = await yaml`
a:
  le maximum de:
    - 10
    - 4.4
    - -5
`
		expect(a.evaluate()).toBe(10)
	})

	it('une seule valeur', async () => {
		const { a } = await yaml`
a:
  le maximum de:
    - -10
`
		expect(a.evaluate()).toBe(-10)
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
		expect(a.evaluate()).toBe(undefined)
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
		expect(a.evaluate()).toBe(10)
	})
})
