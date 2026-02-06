import { describe, it, expect } from 'bun:test'
import { yaml } from '../compile'

describe('Remplace > transitivité', () => {
	it('simple', async () => {
		const { x } = await yaml`
    a:
      remplace: b
      valeur: 1
    b:
      remplace: c
      valeur: 2
    c: 3
    x: c
  `
		expect(x.evaluate()).toBe(1)
	})

	it('non applicable', async () => {
		const { x } = await yaml`
    a:
      applicable si: non
      remplace: b
      valeur: 1
    b:
      remplace: c
      valeur: 2
    c:
      remplace: d
      valeur: 3
    d: 4
    x: d
  `
		expect(x.evaluate()).toBe(2)
	})
})
