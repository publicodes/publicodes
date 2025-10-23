import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Rend non applicable > simple', () => {
	it('si règle vrai', async () => {
		const { 'à payer': àPayer } = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        rend non applicable: impôt
        valeur: oui
      `
		expect(àPayer.evaluate()).toBe(null)
	})
	it('si règle vaut non', async () => {
		const { 'à payer': àPayer } = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        valeur: non
        rend non applicable: impôt
      `
		expect(àPayer.evaluate()).toBe(1000)
	})

	it('si règle non applicable', async () => {
		const { 'à payer': àPayer } = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        applicable si: non
        rend non applicable: impôt
      `
		expect(àPayer.evaluate()).toBe(1000)
	})

	it('si règle non définie', async () => {
		const r = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        rend non applicable: impôt
      `
		expect(r['à payer'].evaluate()).toBe(1000)
		expect(r['exilé fiscal'].type).toBe('boolean')
	})
})
