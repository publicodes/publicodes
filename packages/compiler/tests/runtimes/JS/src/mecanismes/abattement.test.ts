import { describe, test, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../compile'

describe('Mécanisme > abattement', () => {
	describe('abattement simples', () => {
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
})
