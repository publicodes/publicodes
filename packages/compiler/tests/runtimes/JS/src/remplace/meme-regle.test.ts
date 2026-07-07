import { describe, it, expect } from 'bun:test'
import { yaml } from '../compile'

describe('Remplace > même règle', () => {
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

	it('avec exclusif erronée', async () => {
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
		// todo
	})
})
