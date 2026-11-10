import { describe, test, expect } from 'bun:test'
import { p, yaml } from '../compile'

describe('Rend non applicable > simple', () => {
	test('si règle vrai', async () => {
		const { 'à payer': àPayer } = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        rend non applicable: impôt
        valeur: oui
      `
		expect(p.isNotApplicable(àPayer.evaluate().value)).toBeTrue()
	})

	test('si règle vaut non', async () => {
		const { 'à payer': àPayer } = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        valeur: non
        rend non applicable: impôt
      `
		expect(àPayer.evaluate().value).toBe(1000)
	})

	test('si règle non applicable', async () => {
		const { 'à payer': àPayer } = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        applicable si: non
        rend non applicable: impôt
      `
		expect(àPayer.evaluate().value).toBe(1000)
	})

	test('si règle non définie', async () => {
		const r = await yaml`
      impôt: 1000€
      à payer: impôt
      exilé fiscal:
        rend non applicable: impôt
      `
		expect(r['à payer'].evaluate().value).toBe(1000)
		expect(r['exilé fiscal'].type).toBe('unknown')
	})

	test('avec des règles de types différents', async () => {
		const { result } = await yaml`
result:
  valeur: bool
  avec:
    number:
      rend non applicable: bool

    bool:
      valeur: oui
`

		expect(result.evaluate().value).toEqual(true)
		expect(
			result.evaluate({ 'result . number': p.NotApplicable }).value,
		).toEqual(true)
		expect(result.evaluate({ 'result . number': false }).value).toEqual(true)
		expect(result.evaluate({ 'result . number': true }).value).toEqual(
			p.NotApplicable,
		)
		expect(result.evaluate({ 'result . number': 10 }).value).toEqual(
			p.NotApplicable,
		)
	})
})
