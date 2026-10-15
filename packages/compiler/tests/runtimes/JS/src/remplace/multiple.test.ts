import { describe, it, expect } from 'bun:test'
import { yaml } from '../compile'

describe('Remplace > multiple', () => {
	it('avec exclusif', async () => {
		const { x } = await yaml`
    a:
      applicable si: b > 3
      remplace:
        références à: c
        exclusif: oui
      valeur: 1
    b:
      remplace:
        références à: c
        exclusif: oui
      valeur: 2
    c:
    x: c
  `
		expect(x.evaluate().value).toBe(2)
	})

	it('avec exclusif erroné', async () => {
		const { x } = await yaml`
    a:
      remplace:
        références à: c
        exclusif: oui
      valeur: 1
    b:
      remplace:
        références à: c
        exclusif: oui
      valeur: 2
    c:
    x: c
  `
		expect(() => x.evaluate().value).toThrowError(
			'Exclusivity check: more than 1 applicable replacement b, a',
		)
	})
})
