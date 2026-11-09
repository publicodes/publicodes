import { describe, test, expect } from 'bun:test'
import { yaml, p } from '../compile'

describe('Mécanisme > barème', () => {
	test('simples', async () => {
		const engine = await yaml`
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

		expect(engine['impôt sur le revenu'].evaluate().value).toBe(10531.06)
	})

	test('multiplicateur', async () => {
		const engine = await yaml`
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

		expect(engine['cotisation retraite'].evaluate().value).toBe(7378.85)
	})

	test('quand non-définie', async () => {
		const engine = await yaml`
impôt sur le revenu:
  barème:
    - taux: 0%
      plafond: premier plafond
    - taux: deuxieme taux
      plafond: 27086 €
    - taux: 30%
      plafond: 72617 €
    - taux: 41%
      plafond: 153783 €
    - taux: dernier taux
  arrondi: 0.01
premier plafond:
deuxieme taux:
dernier taux:
`

		expect(
			p.isNotDefined(engine['impôt sur le revenu'].evaluate().value),
		).toBeTrue()
		expect(
			engine['impôt sur le revenu'].evaluate({
				'impôt sur le revenu': 54126,
				'premier plafond': 9807,
				'deuxieme taux': 14,
				'dernier taux': 45,
			}).value,
		).toBe(10531.06)
		expect(
			p.isNotDefined(
				engine['impôt sur le revenu'].evaluate({
					//'impôt sur le revenu': 54126,
					'premier plafond': 9807,
					'deuxieme taux': 14,
					'dernier taux': 45,
				}).value,
			),
		).toBeTrue()
		expect(
			p.isNotDefined(
				engine['impôt sur le revenu'].evaluate({
					'impôt sur le revenu': 54126,
					//'premier plafond': 9807,
					'deuxieme taux': 14,
					'dernier taux': 45,
				}).value,
			),
		).toBeTrue()
		expect(
			p.isNotDefined(
				engine['impôt sur le revenu'].evaluate({
					'impôt sur le revenu': 54126,
					'premier plafond': 9807,
					//'deuxieme taux': 14,
					'dernier taux': 45,
				}).value,
			),
		).toBeTrue()
		expect(
			p.isNotDefined(
				engine['impôt sur le revenu'].evaluate({
					'impôt sur le revenu': 54126,
					'premier plafond': 9807,
					'deuxieme taux': 14,
					//'dernier taux': 45,
				}).value,
			),
		).toBeTrue()
	})

	test('quand non-applicable', async () => {
		const engine = await yaml`
impôt sur le revenu:
  valeur: valeur
  barème:
    - taux: 0%
      plafond: premier plafond
    - taux: deuxieme taux
      plafond: 27086 €
    - taux: 30%
      plafond: 72617 €
    - taux: 41%
      plafond: 153783 €
    - taux: dernier taux
  arrondi: 0.01
valeur:
  valeur: 54126 €
  applicable si: est applicable
  avec:
    est applicable: oui
premier plafond:
  valeur: 9807 €
  applicable si: est applicable
  avec:
    est applicable: oui
deuxieme taux:
  valeur: 14%
  applicable si: est applicable
  avec:
    est applicable: oui
dernier taux:
  valeur: 45%
  applicable si: est applicable
  avec:
    est applicable: oui
`

		expect(engine['impôt sur le revenu'].evaluate().value).toBe(10531.06)
		expect(
			p.isNotApplicable(
				engine['impôt sur le revenu'].evaluate({
					'valeur . est applicable': false,
				}).value,
			),
		).toBeTrue()
		expect(
			engine['impôt sur le revenu'].evaluate({
				'premier plafond . est applicable': false,
			}).value,
		).toBe(11904.04)
		expect(
			engine['impôt sur le revenu'].evaluate({
				'deuxieme taux . est applicable': false,
			}).value,
		).toBe(13295.7)
		expect(
			engine['impôt sur le revenu'].evaluate({
				'dernier taux . est applicable': false,
			}).value,
		).toBe(10531.06)
	})
})
