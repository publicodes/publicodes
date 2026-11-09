import { describe, test, expect } from 'bun:test'
import { yaml, p } from '../compile'

describe('Mécanisme > barème', () => {
	test('simples', async () => {
		const engine = await yaml`
revenu imposable: 100 €
impôt sur le revenu:
  valeur: revenu imposable
  barème:
    - taux: 0%
      plafond: 50 €
    - taux: 10%         # 20 € -> 2 €
      plafond: 70 €
    - taux: 20%         # 20 € -> 4 €
      plafond: 90 €
    - taux: 10%         # 10 € -> 1 €
`

		expect(engine['impôt sur le revenu'].evaluate().value).toBe(7)
	})

	test('multiplicateur', async () => {
		const engine = await yaml`
assiette retraite: 100
plafond sécurité sociale: 120 €
cotisation retraite:
  valeur: assiette retraite
  barème:
    - taux: 20%                    # 60 € -> 12 €
      plafond: 0.5 * multiplicateur
    - taux: 0.6%                   # 40 € -> 0.24 €
  avec:
    multiplicateur: plafond sécurité sociale
  arrondi: 0.01
`

		expect(engine['cotisation retraite'].evaluate().value).toBe(12.24)
	})

	test('quand non-définie', async () => {
		const engine = await yaml`
impôt sur le revenu:
  barème:
    - taux: 0%
      plafond: premier plafond
    - taux: deuxieme taux
      plafond: 100 €
    - taux: 50%
      plafond: 200 €
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
				'impôt sur le revenu': 300,
				'premier plafond': 50, // 50 € -> 0 €
				'deuxieme taux': 10, // 50 € -> 5 €
				// 100 € -> 50 €
				'dernier taux': 45, // 100 € -> 45 €
			}).value,
		).toBe(100)
		expect(
			p.isNotDefined(
				engine['impôt sur le revenu'].evaluate({
					//'impôt sur le revenu': 300,
					'premier plafond': 50,
					'deuxieme taux': 10,
					'dernier taux': 45,
				}).value,
			),
		).toBeTrue()
		expect(
			p.isNotDefined(
				engine['impôt sur le revenu'].evaluate({
					'impôt sur le revenu': 300,
					//'premier plafond': 50,
					'deuxieme taux': 10,
					'dernier taux': 45,
				}).value,
			),
		).toBeTrue()
		expect(
			p.isNotDefined(
				engine['impôt sur le revenu'].evaluate({
					'impôt sur le revenu': 300,
					'premier plafond': 50,
					//'deuxieme taux': 10,
					'dernier taux': 45,
				}).value,
			),
		).toBeTrue()
		expect(
			p.isNotDefined(
				engine['impôt sur le revenu'].evaluate({
					'impôt sur le revenu': 300,
					'premier plafond': 50,
					'deuxieme taux': 10,
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
      plafond: 100 €
    - taux: 50%
      plafond: 200 €
    - taux: dernier taux
  arrondi: 0.01
valeur:
  valeur: 300 €
  applicable si: est applicable
  avec:
    est applicable: oui
premier plafond:
  valeur: 50 €
  applicable si: est applicable
  avec:
    est applicable: oui
deuxieme taux:
  valeur: 10%
  applicable si: est applicable
  avec:
    est applicable: oui
dernier taux:
  valeur: 45%
  applicable si: est applicable
  avec:
    est applicable: oui
`

		expect(engine['impôt sur le revenu'].evaluate().value).toBe(100)
		expect(
			p.isNotApplicable(
				engine['impôt sur le revenu'].evaluate({
					'valeur . est applicable': false,
				}).value,
			),
		).toBeTrue()
		expect(
			// #- taux: 0%
			// #  plafond: 50 €
			// - taux: 10%      # 100 € -> 10 €
			//   plafond: 100 €
			// - taux: 50%      # 100 € -> 50 €
			//   plafond: 200 €
			// - taux: 45%      # 100 € -> 45 €
			engine['impôt sur le revenu'].evaluate({
				'premier plafond . est applicable': false,
			}).value,
		).toBe(105)
		expect(
			// - taux: 0%        # 50 € -> 0 €
			//   plafond: 50 €
			// #- taux: 10%
			// #  plafond: 100 €
			// - taux: 50%       # 150 € -> 75 €
			//   plafond: 200 €
			// - taux: 45%       # 100 € -> 45 €
			engine['impôt sur le revenu'].evaluate({
				'deuxieme taux . est applicable': false,
			}).value,
		).toBe(120)
		expect(
			// - taux: 0%       # 50 € -> 0 €
			//   plafond: 50 €
			// - taux: 10%      # 50 € -> 5 €
			//   plafond: 100 €
			// - taux: 50%      # 100 € -> 50 €
			//   plafond: 200 €
			// #- taux: 45%
			engine['impôt sur le revenu'].evaluate({
				'dernier taux . est applicable': false,
			}).value,
		).toBe(55)
	})
})
