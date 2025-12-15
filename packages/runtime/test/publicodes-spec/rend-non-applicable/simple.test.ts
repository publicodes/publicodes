import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Rend non applicable > simple', () => {
	it('si règle vrai', async () => {
		const engine = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        rend non applicable: impôt
        valeur: oui
      `
		expect(engine.evaluate('à payer').value).toBe(null)
	})
	it('si règle vaut non', async () => {
		const engine = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        valeur: non
        rend non applicable: impôt
      `
		expect(engine.evaluate('à payer').value).toBe(1000)
	})

	it('si règle non applicable', async () => {
		const engine = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        applicable si: non
        rend non applicable: impôt
      `
		expect(engine.evaluate('à payer').value).toBe(1000)
	})

	it('si règle non définie', async () => {
		const engine = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        rend non applicable: impôt
      `
		expect(engine.evaluate('à payer').value).toBe(1000)
		expect(engine.outputs['exilé fiscal'].type).toEqual({ boolean: true })
	})
})
