import { describe, test, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml, p } from '../compile'

describe('Mécanisme > abattement', () => {
	describe('simples', () => {
		let engine: TestPublicodes
		beforeAll(async () => {
			engine = await yaml`
abattement flat:
  valeur: 10000€
  abattement: 2000€

abattement flat 2:
  valeur: 5000
  abattement: 1000€

abattement pourcentage:
  valeur: 10000€
  abattement: 10%

abattement pourcentage 2:
  valeur: 5000€
  abattement: 20%

abattement pourcentage 3:
  valeur: 2000€
  abattement: 10%
`
		})

		test.each([
			['abattement flat', 8000],
			['abattement flat 2', 4000],
			['abattement pourcentage', 9000],
			['abattement pourcentage 2', 4000],
			['abattement pourcentage 3', 1800],
		])('%s', (name, expected) => {
			expect(engine[name].evaluate().value).toBe(expected)
		})
	})

	test('quand non-définie', async () => {
		const engine = await yaml`
abattement:
  valeur: 10000€
  abattement: montant
montant:
`

		expect(p.isNotDefined(engine['abattement'].evaluate().value)).toBeTrue()
	})

	test('quand non-applicable', async () => {
		const engine = await yaml`
abattement:
  valeur: 10000€
  abattement: montant
montant:
  valeur: 2000
  applicable si: est applicable
  avec:
    est applicable: oui
`

		expect(
			engine['abattement'].evaluate({ 'montant . est applicable': true }).value,
		).toBe(8000)
		expect(
			engine['abattement'].evaluate({ 'montant . est applicable': false })
				.value,
		).toBe(10000)
	})
})
