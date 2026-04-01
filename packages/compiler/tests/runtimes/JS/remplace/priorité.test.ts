import { describe, it, expect } from 'bun:test'
import { yaml } from '../compile'

describe('Remplace > priorité', () => {
	it('simple', async () => {
		const { x } = await yaml`
    a:
      remplace:
        références à: c
        priorité: 1
      valeur: 1
    b:
      remplace: c
      valeur: 2
    c:
    x: c
  `
		expect(x.evaluate()).toBe(1)
	})

	it('non applicable', async () => {
		const { x } = await yaml`
    a:
      non applicable si: oui
      remplace:
        références à: c
        priorité: 1
      valeur: 1
    b:
      remplace: c
      valeur: 2
    c:
    x: c
  `
		expect(x.evaluate()).toBe(2)
	})
})
