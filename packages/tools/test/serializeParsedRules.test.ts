import Engine from 'publicodes'
import { describe, expect, it } from 'vitest'
import { serializeParsedRules } from '../src/index'

describe('API > mecanisms list', () => {
	it('should serialize empty rules', () => {
		expect(serializeParsedRules({})).toStrictEqual({})
	})

	it('should serialize rule with constant [valeur]', () => {
		const rules = {
			rule: {
				titre: 'My rule',
				valeur: 10,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with ref [valeur]', () => {
		const rules = {
			rule: {
				titre: 'My rule',
				valeur: 10,
			},
			rule2: {
				titre: 'Rule with a ref',
				valeur: 'rule',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with constant [formule]', () => {
		const rules = {
			rule: {
				titre: 'My rule',
				formule: '10 * rule2',
			},
			rule2: {
				valeur: 2,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual({
			rule: {
				titre: 'My rule',
				valeur: '10 * rule2',
			},
			rule2: {
				valeur: 2,
			},
		})
	})

	it('should serialize rule with ref [applicable si]', () => {
		const rules = {
			rule: {
				'applicable si': 'rule2',
				valeur: 10,
			},
			rule2: {
				valeur: 20,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with condition [applicable si]', () => {
		const rules = {
			rule: {
				'applicable si': 'rule2 < 5',
				valeur: 10,
			},
			rule2: {
				valeur: 20,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with condition [non applicable si]', () => {
		const rules = {
			rule: {
				'non applicable si': 'rule2 < 5',
				valeur: 10,
			},
			rule2: {
				valeur: 20,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [est non défini]', () => {
		const rules = {
			rule: {
				'est non défini': 'rule2',
			},
			rule2: {
				valeur: 20,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [est défini]', () => {
		const rules = {
			rule: {
				'est défini': 'rule2',
			},
			rule2: {
				valeur: 20,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [est non applicable]', () => {
		const rules = {
			rule: {
				'est non applicable': 'rule2',
			},
			rule2: {
				valeur: 20,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [est applicable]', () => {
		const rules = {
			rule: {
				'est applicable': 'rule2',
			},
			rule2: {
				valeur: 20,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [une de ces conditions]', () => {
		const rules = {
			rule: {
				'une de ces conditions': ['rule2', 'rule2 < 5'],
			},
			rule2: {
				valeur: 20,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [toutes ces conditions]', () => {
		const rules = {
			rule: {
				'toutes ces conditions': ['rule2', 'rule2 < 5'],
			},
			rule2: {
				valeur: 20,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [produit]', () => {
		const rules = {
			volume: {
				produit: ['2.5 m', '3 m', '4 m'],
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [produit] (without unit)', () => {
		const rules = {
			volume: {
				produit: [2.5, 3, 4],
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [variations]', () => {
		const rules = {
			'taux réduit': {
				valeur: 'oui',
			},
			'taux majoré': {
				valeur: 'non',
			},
			'taux allocation familiales': {
				variations: [
					{
						si: 'taux réduit',
						alors: '3.45 %',
					},
					{
						si: 'taux majoré',
						alors: '10 %',
					},
					{ sinon: '5.25 %' },
				],
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [somme]', () => {
		const rules = {
			exemple: {
				somme: ['15.89 €', '12 % * 14 €', '-20 €'],
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [moyenne]', () => {
		const rules = {
			exemple: {
				moyenne: ['15.89 €', '12 % * 14 €', '-20 €'],
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [le maximum de]', () => {
		const rules = {
			max: {
				'le maximum de': ['15.89 €', '12 % * 14 €', '-20 €'],
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [le minimum de]', () => {
		const rules = {
			max: {
				'le minimum de': ['15.89 €', '12 % * 14 €', '-20 €'],
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [arrondi]', () => {
		const rules = {
			arrondi: {
				arrondi: 'oui',
				valeur: 10.5,
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [arrondi] (example 2)', () => {
		const rules = {
			arrondi: {
				arrondi: '2 décimales',
				valeur: '2 / 3',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [contexte]', () => {
		const rules = {
			brut: {
				valeur: '2000 €',
			},
			cotisation: {
				valeur: 'brut * 20 %',
			},
			'cotisation pour un SMIC': {
				valeur: 'cotisation',
				contexte: {
					brut: '1500 €',
				},
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [contexte] applied to a [somme]', () => {
		const rules = {
			brut: {
				valeur: '2000 €',
			},
			cotisation: {
				valeur: 'brut * 20 %',
			},
			'cotisation pour un SMIC': {
				somme: ['cotisation'],
				contexte: {
					brut: '1500 €',
				},
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [barème]', () => {
		const rules = {
			'revenu imposable': {
				valeur: '54126 €',
			},
			'impôt sur le revenu': {
				barème: {
					assiette: 'revenu imposable',
					tranches: [
						{ taux: '0 %', plafond: '9807 €' },
						{ taux: '14 %', plafond: '27086 €' },
						{ taux: '30 %', plafond: '72617 €' },
						{ taux: '41 %', plafond: '153783 €' },
						{ taux: '45 %' },
					],
				},
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [grille]', () => {
		const rules = {
			'SMIC horaire': {
				valeur: '10 €/heures',
			},
			'revenu cotisé': {
				valeur: '1900 €/an',
			},
			'trimestres validés': {
				unité: 'trimestres validés/an',
				grille: {
					assiette: 'revenu cotisé',
					multiplicateur: 'SMIC horaire',
					tranches: [
						{ montant: 0, plafond: '150 heures/an' },
						{ montant: 1, plafond: '300 heures/an' },
						{ montant: 2, plafond: '450 heures/an' },
						{ montant: 3, plafond: '600 heures/an' },
						{ montant: 4 },
					],
				},
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it("should serialize rule with [barème] and a custom 'multiplicateur'", () => {
		const rules = {
			'revenu imposable': {
				valeur: '54126 €',
			},
			'plafond sécurité sociale': {
				valeur: '41136 €',
			},
			'impôt sur le revenu': {
				barème: {
					assiette: 'revenu imposable',
					multiplicateur: 'plafond sécurité sociale',
					tranches: [
						{ taux: '0 %', plafond: '9807 €' },
						{ taux: '14 %', plafond: '27086 €' },
						{ taux: '30 %', plafond: '72617 €' },
						{ taux: '41 %', plafond: '153783 €' },
						{ taux: '45 %' },
					],
				},
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [taux progressif]', () => {
		const rules = {
			"chiffre d'affaires": {
				valeur: '30000 €/an',
			},
			plafond: {
				valeur: '3000 €/mois',
			},
			'taux de réduction de cotisation': {
				'taux progressif': {
					assiette: "chiffre d'affaires",
					multiplicateur: 'plafond',
					tranches: [
						{ taux: '100 %', plafond: '75 %' },
						{ taux: '0 %', plafond: '100 %' },
					],
				},
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [abattement]', () => {
		const rules = {
			'revenu imposable simple': {
				valeur: '30000 €',
				abattement: '2000 €',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [plancher]', () => {
		const rules = {
			'temperature mesurée': {
				valeur: '-500 °C',
				plancher: '-273.15 °C',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [plafond]', () => {
		const rules = {
			'déduction fiscale': {
				valeur: '1300 €/mois',
				plafond: '200 €/mois',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [durée]', () => {
		const rules = {
			"date d'embauche": {
				valeur: '14/04/2008',
			},
			"ancienneté en fin d'année": {
				durée: {
					depuis: "date d'embauche",
					"jusqu'à": '31/12/2020',
				},
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [unité]', () => {
		const rules = {
			test1: {
				valeur: 35,
				unité: '€/mois',
			},
			test2: {
				valeur: '35 €/mois',
			},
			test3: {
				variations: [
					{ si: 'test1 > 0', alors: 'test1' },
					{
						sinon: {
							somme: ['test1', 'test2'],
							unité: '€/mois',
						},
					},
				],
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [par défaut]', () => {
		const rules = {
			'prix HT': {
				valeur: '50 €',
			},
			'prix TTC': {
				valeur: 'prix HT * (100 % + TVA)',
			},
			TVA: {
				valeur: '50 %',
				'par défaut': '20 %',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [avec]', () => {
		const rules = {
			'prix final': {
				valeur: 'prix de base * (100% - réduction)',
				avec: {
					'prix de base': '157 €',
					réduction: '20 %',
				},
			},
			test2: {
				valeur: 'a + b',
				avec: {
					a: null,
					b: null,
				},
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual({
			'prix final': {
				valeur: 'prix de base * (100 % - réduction)',
			},
			'prix final . prix de base': {
				valeur: '157 €',
			},
			'prix final . réduction': {
				valeur: '20 %',
			},
			test2: {
				valeur: 'a + b',
			},
			'test2 . a': null,
			'test2 . b': null,
		})
	})

	it('should serialize rule with [texte]', () => {
		const rules = {
			'aide vélo': {
				texte: `La région subventionne l’achat d’un vélo à hauteur de
    {{ prise en charge }} et jusqu’à un plafond de {{ 500 € }}.
    Les éventuelles aides locales déjà perçues sont déduites de
    ce montant.

    Par exemple, pour un vélo de {{ exemple }}, la région {{ 'Nouvelle Aquitaine' }}
    vous versera {{ exemple * prise en charge }}`,
			},
			'aide vélo . prise en charge': {
				valeur: '50 %',
			},
			'aide vélo . exemple': {
				valeur: '250 €',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with multiple [mécanismes chaînés]', () => {
		const rules = {
			'nombre de repas': {
				valeur: '12 repas',
			},
			'remboursement repas': {
				valeur: 'nombre de repas * 4.21 €/repas',
				plafond: '500 €',
				abattement: '25 €',
				arrondi: 'oui',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with multiple [une possibilité]', () => {
		const rules = {
			'chauffage collectif': {
				question: 'Votre chauffage est-il collectif ou individuel ?',
				'par défaut': "'collectif'",
				'une possibilité': ['collectif', 'individuel'],
				avec: {
					collectif: null,
					individuel: null,
				},
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual({
			'chauffage collectif': {
				question: 'Votre chauffage est-il collectif ou individuel ?',
				'par défaut': "'collectif'",
				'une possibilité': ['collectif', 'individuel'],
			},
			'chauffage collectif . collectif': null,
			'chauffage collectif . individuel': null,
		})
	})

	it('should serialize rule with [remplacement]', () => {
		const rules = {
			'frais de repas': {
				valeur: '5 €/repas',
			},
			'cafés-restaurants': {
				valeur: 'oui',
			},
			'cafés-restaurants . frais de repas': {
				remplace: {
					'références à': 'frais de repas',
				},
				valeur: '6 €/repas',
			},
			'montant repas mensuels': {
				valeur: '20 repas * frais de repas',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [remplacement] with a shorten rule ref', () => {
		const rules = {
			'cafés-restaurants': {
				valeur: 'oui',
			},
			'cafés-restaurants . frais de repas': {
				remplace: {
					'références à': 'montant repas mensuels . frais de repas',
				},
				valeur: '6 €/repas',
			},
			'montant repas mensuels': {
				valeur: '20 repas * frais de repas',
			},
			'montant repas mensuels . frais de repas': {
				valeur: '5 €/repas',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual({
			...rules,
			'montant repas mensuels': {
				valeur: '20 repas * montant repas mensuels . frais de repas',
			},
		})
	})

	it('should serialize rule with [remplacement] in a specified context', () => {
		const rules = {
			foo: {
				valeur: 0,
			},
			'foo remplacé dans résultat 1': {
				remplace: {
					'références à': 'foo',
					priorité: 2,
					dans: 'résultat 1',
				},
				valeur: 2,
			},
			'foo remplacé dans résultat 2': {
				remplace: {
					'références à': 'foo',
					'sauf dans': 'résultat 1',
				},
				valeur: 3,
			},
			'résultat 1': { valeur: 'foo' },
			'résultat 2': { valeur: 'foo' },
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual({
			...rules,
			'foo remplacé dans résultat 1': {
				remplace: {
					'références à': 'foo',
					priorité: 2,
					dans: ['résultat 1'],
				},
				valeur: 2,
			},
			'foo remplacé dans résultat 2': {
				remplace: {
					'références à': 'foo',
					'sauf dans': ['résultat 1'],
				},
				valeur: 3,
			},
		})
	})

	it('should serialize rule with [inversion]', () => {
		const rules = {
			bruts: {
				unité: '€/an',
				'par défaut': '0 €/an',
				'inversion numérique': ["nets d'impôt"],
			},
			"nets d'impôt": {
				valeur: '0 €/an',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [résoudre la référence circulaire]', () => {
		const rules = {
			x: {
				valeur: '(4 * x) - 5',
				'résoudre la référence circulaire': 'oui',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})

	it('should serialize rule with [private rule]', () => {
		const rules = {
			assiette: {
				valeur: '2100 €',
			},
			cotisation: {
				produit: ['assiette', 'taux'],
			},
			'[privé] taux': {
				valeur: '2.8 %',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).baseContext.parsedRules,
		)
		expect(serializedRules).toStrictEqual({
			assiette: {
				valeur: '2100 €',
			},
			cotisation: {
				produit: ['assiette', 'taux'],
			},
			taux: {
				privé: 'oui',
				valeur: '2.8 %',
			},
		})
	})

	it('should serialize rule with [private rule] inside [avec]', () => {
		const rules = {
			assiette: {
				valeur: '2100 €',
			},
			cotisation: {
				produit: ['assiette', 'taux'],
				avec: {
					'[privé] taux': {
						valeur: '2.8 %',
					},
				},
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).baseContext.parsedRules,
		)
		expect(serializedRules).toStrictEqual({
			assiette: {
				valeur: '2100 €',
			},
			cotisation: {
				produit: ['assiette', 'taux'],
			},
			'cotisation . taux': {
				privé: 'oui',
				valeur: '2.8 %',
			},
		})
	})
})

describe('More complexe cases', () => {
	it('should serialize the same rules multiple times', () => {
		const rules = {
			ruleA: {
				titre: 'Rule A',
				valeur: 'B . C * D',
			},
			'ruleA . B . C': {
				valeur: '10',
			},
			'ruleA . D': {
				valeur: '3',
			},
		}
		const parsedRules = new Engine(rules, {
			strict: { noOrphanRule: false },
		}).getParsedRules()

		expect(serializeParsedRules(parsedRules)).toStrictEqual(
			serializeParsedRules(parsedRules),
		)
	})

	it('should correctly serialize [valeur] composed with other mecanisms', () => {
		const rules = {
			ex1: {
				valeur: {
					somme: ['15.89 €', '12 % * 14 €', '-20 €'],
				},
			},
			ex2: {
				valeur: '2 * 15.89 €',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual({
			ex1: {
				somme: ['15.89 €', '12 % * 14 €', '-20 €'],
			},
			ex2: {
				valeur: '2 * 15.89 €',
			},
		})
	})

	it('should correclty serialize complexe [unité]', () => {
		const rules = {
			ex1: {
				valeur: 10,
				unité: '€/part.an',
			},
		}
		const serializedRules = serializeParsedRules(
			new Engine(rules).getParsedRules(),
		)
		expect(serializedRules).toStrictEqual(rules)
	})
})
