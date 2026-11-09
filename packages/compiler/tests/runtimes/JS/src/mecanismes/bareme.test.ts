import { describe, test, expect, beforeAll } from 'bun:test'
import { p, TestPublicodes, yaml } from '../compile'

describe('Mécanisme > barème', () => {
	describe('barème simples', () => {
		let engine: TestPublicodes
		beforeAll(async () => {
			engine = await yaml`
revenu imposable: 54126 €
impôt sur le revenu:
  valeur: revenu imposable
  barème:
    - taux: 0%
      plafond: 9807 €
    - taux: 14%
      plafond: 27086 €
    - taux: 30%
      plafond: 72617 €
    - taux: 41%
      plafond: 153783 €
    - taux: 45%
  arrondi: 0.01
`
		})

		test.each([['impôt sur le revenu', 10531.06]])('%s', (name, expected) => {
			expect(engine[name].evaluate().value).toBe(expected)
		})
	})

	describe('barème multiplicateur', () => {
		let engine: TestPublicodes
		beforeAll(async () => {
			engine = await yaml`
assiette retraite: 54004 €
plafond sécurité sociale: 41136 €
cotisation retraite:
  valeur: assiette retraite
  barème:
    - taux: 17.75%
      plafond: 1 * multiplicateur
    - taux: 0.6%
  avec:
    multiplicateur: plafond sécurité sociale
  arrondi: 0.01
`
		})

		test.each([['cotisation retraite', 7378.85]])('%s', (name, expected) => {
			expect(engine[name].evaluate().value).toBe(expected)
		})
	})
})
