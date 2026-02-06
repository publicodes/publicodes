import Engine, { RawPublicodes, RuleNode } from 'publicodes'
import { describe, it, expect } from 'bun:test'
import { serializeParsedRules } from '../../src'
import { RuleName, RawRules, disabledLogger } from '../../src/commons'
import { constantFolding } from '../../src/optims/'
import { callWithEngine } from '../utils'

function constantFoldingWith(
	rawRules: RawPublicodes<string>,
	targets?: RuleName[],
): RawRules {
	const res = callWithEngine(
		(engine) =>
			constantFolding(engine, {
				toKeep:
					targets ?
						(rule: RuleNode) => targets.includes(rule.dottedName)
					:	undefined,
			}),
		rawRules,
	)
	return serializeParsedRules(res)
}

// NOTE(@EmileRolley): I modified `toStrictEqual` to `toEqual` when using `structuredClone`
// instead of `JSON.parse(JSON.stringify())`.
describe('Constant folding [meta]', () => {
	it('should not modify the original rules', () => {
		const rawRules = {
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
		const engine = new Engine(rawRules, {
			logger: disabledLogger,
			strict: { noOrphanRule: false },
		})
		const baseParsedRules = engine.getParsedRules()
		const serializedBaseParsedRules = serializeParsedRules(baseParsedRules)

		constantFolding(engine, { toKeep: (rule) => rule.dottedName === 'ruleA' })

		const shouldNotBeModifiedRules = engine.getParsedRules()
		const serializedShouldNotBeModifiedRules = serializeParsedRules(
			shouldNotBeModifiedRules,
		)

		expect(baseParsedRules).toEqual(shouldNotBeModifiedRules)
		expect(serializedBaseParsedRules).toEqual(
			serializedShouldNotBeModifiedRules,
		)
	})

	it('should not fold a rule specified in the [toAvoid] option', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				valeur: 'B . C * D',
			},
			ruleB: {
				valeur: 'ruleA . B . C * 3',
			},
			'ruleA . D': {
				question: "What's the value of D?",
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		const engine = new Engine(rawRules, {
			logger: disabledLogger,
			strict: { noOrphanRule: false },
		})
		const foldedRules = serializeParsedRules(
			constantFolding(engine, {
				toAvoid: (rule) => rule.dottedName === 'ruleB',
			}),
		)
		expect(foldedRules).toEqual({
			...rawRules,
			ruleA: {
				optimized: 'partially',
				titre: 'Rule A',
				valeur: '10 * D',
			},
			'ruleA . B . C': {
				optimized: 'fully',
				valeur: 10,
			},
		})
	})
})

describe('Constant folding [base]', () => {
	it('∅ -> ∅', () => {
		expect(constantFoldingWith({})).toEqual({})
	})

	it('should remove empty nodes', () => {
		expect(
			constantFoldingWith({
				ruleB: {
					valeur: '10 * 10',
				},
			}),
		).toEqual({
			ruleB: {
				valeur: 100,
				optimized: 'fully',
			},
		})
	})

	it('one deps', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				valeur: 'B . C * 3',
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		expect(constantFoldingWith(rawRules, ['ruleA'])).toEqual({
			ruleA: {
				titre: 'Rule A',
				valeur: 30,
				optimized: 'fully',
			},
		})
	})

	it('should replace a [valeur] with 2 dependencies with the corresponding constant value', () => {
		const rawRules = {
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
		expect(constantFoldingWith(rawRules, ['ruleA'])).toEqual({
			ruleA: {
				titre: 'Rule A',
				valeur: 30,
				optimized: 'fully',
			},
		})
	})

	it('should replace the constant reference without being able to fold entirely the rule', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				valeur: 'B . C * D',
			},
			'ruleA . D': {
				question: "What's the value of D",
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		expect(constantFoldingWith(rawRules, ['ruleA'])).toEqual({
			ruleA: {
				titre: 'Rule A',
				valeur: '10 * D',
				optimized: 'partially',
			},
			'ruleA . D': {
				question: "What's the value of D",
			},
		})
	})

	it('should partially fold rule with constant with multiple parents dependencies', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				valeur: 'B . C * D',
			},
			ruleB: {
				valeur: 'ruleA . B . C * 3',
			},
			'ruleA . D': {
				question: "What's the value of D?",
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		expect(constantFoldingWith(rawRules, ['ruleA'])).toEqual({
			ruleA: {
				titre: 'Rule A',
				valeur: '10 * D',
				optimized: 'partially',
			},
			'ruleA . D': {
				question: "What's the value of D?",
			},
		})
	})

	it('should partially fold rule with constant with multiple parents dependencies add keep the only targeted rule: [ruleA]', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				valeur: 'B . C * D',
			},
			ruleB: {
				valeur: 'ruleA . B . C * 3',
			},
			'ruleA . D': {
				question: "What's the value of D?",
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		expect(constantFoldingWith(rawRules, ['ruleA'])).toEqual({
			ruleA: {
				titre: 'Rule A',
				valeur: '10 * D',
				optimized: 'partially',
			},
			'ruleA . D': {
				question: "What's the value of D?",
			},
		})
	})

	it('should fold a constant within _two degrees_', () => {
		const rawRules = {
			A: {
				valeur: 'B',
			},
			'A . B': {
				valeur: 'C * 10',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules, ['A'])).toEqual({
			A: {
				valeur: 70,
				optimized: 'fully',
			},
		})
	})

	it('should fold constant within two degrees with B, a partially foldable rule', () => {
		const rawRules = {
			A: {
				valeur: 'B',
			},
			B: {
				valeur: 'A . B * D',
			},
			'B . D': {
				question: "What's the value of B . D?",
			},
			'A . B': {
				valeur: 'C * 10',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules, ['B'])).toEqual({
			B: {
				valeur: '70 * D',
				optimized: 'partially',
			},
			'B . D': {
				question: "What's the value of B . D?",
			},
		})
	})

	it('should completely fold a [somme] mechanism', () => {
		const rawRules = {
			ruleA: {
				valeur: 'ruleB',
			},
			ruleB: {
				somme: ['A . B * 2', 10, 12 * 2],
			},
			'A . B': {
				valeur: 'C * 10',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules, ['ruleA'])).toEqual({
			ruleA: {
				valeur: 174,
				optimized: 'fully',
			},
		})
	})

	it('should partially fold [valeur > somme] mechanism', () => {
		const rawRules = {
			ruleA: {
				valeur: 'ruleB',
			},
			ruleB: {
				valeur: {
					somme: ['A . B * D', 10, 12 * 2],
				},
			},
			'ruleB . D': {
				question: "What's the value of ruleB . D?",
			},
			'A . B': {
				valeur: 'C * 10',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules, ['ruleA'])).toEqual({
			ruleA: {
				valeur: 'ruleB',
			},
			ruleB: {
				somme: ['70 * D', 10, 24],
				optimized: 'partially',
			},
			'ruleB . D': {
				question: "What's the value of ruleB . D?",
			},
		})
	})

	it('should fold a mutiple [somme] deep dependencies', () => {
		const rawRules = {
			omr: {
				valeur: {
					somme: ['omr . putrescibles', 'omr . papier carton'],
				},
			},
			'omr . putrescibles': {
				valeur: {
					somme: ['stockage', 'incinération'],
				},
			},
			'omr . putrescibles . stockage': {
				valeur: 'stockage . pourcentage * stockage . impact',
				unité: 'kgCO2e',
			},
			'omr . putrescibles . stockage . pourcentage': {
				valeur: '24%',
			},
			'omr . putrescibles . stockage . impact': {
				valeur: 0.692,
				unité: 'kgCO2e/kg',
			},
			'omr . putrescibles . incinération': {
				valeur: 'incinération . pourcentage * incinération . impact',
				unité: 'kgCO2e',
			},
			'omr . putrescibles . incinération . pourcentage': {
				valeur: '68%',
			},
			'omr . putrescibles . incinération . impact': {
				valeur: 0.045,
				unité: 'kgCO2e/kg',
			},
			'omr . papier carton': {
				valeur: {
					somme: ['stockage', 'incinération'],
				},
			},
			'omr . papier carton . stockage': {
				valeur: 'stockage . pourcentage * stockage . impact',
			},
			'omr . papier carton . stockage . pourcentage': {
				valeur: '26%',
			},
			'omr . papier carton . stockage . impact': {
				valeur: 0.95,
			},
			'omr . papier carton . incinération': {
				valeur: 'incinération . pourcentage * incinération . impact',
			},
			'omr . papier carton . incinération . pourcentage': {
				valeur: '26%',
			},
			'omr . papier carton . incinération . impact': {
				valeur: 0.95,
			},
		}
		expect(constantFoldingWith(rawRules, ['omr'])).toEqual({
			omr: {
				valeur: '0.69068 kgCO2e',
				optimized: 'fully',
			},
		})
	})

	it('should replace properly child rule references when one is a substring of the other: (Ambiguity with rule name)', () => {
		const rawRules = {
			biogaz: {
				valeur:
					"biogaz . facteur d'émission * gaz . facteur d'émission + not foldable",
			},
			"biogaz . facteur d'émission": {
				valeur: 20,
			},
			"gaz . facteur d'émission": {
				valeur: 10,
			},
			'not foldable': {
				question: 'The user needs to provide a value.',
			},
		}
		expect(constantFoldingWith(rawRules, ['biogaz'])).toEqual({
			biogaz: {
				valeur: '(20 * 10) + not foldable',
				optimized: 'partially',
			},
			'not foldable': {
				question: 'The user needs to provide a value.',
			},
		})
	})

	it('replaceAllRefs bug #1', () => {
		const rawRules = {
			biogaz: {
				valeur:
					"gaz . facteur d'émission * biogaz . facteur d'émission + not foldable",
			},
			"biogaz . facteur d'émission": {
				valeur: 20,
			},
			"gaz . facteur d'émission": {
				valeur: 10,
			},
			'not foldable': {
				question: 'The user needs to provide a value.',
			},
		}
		expect(constantFoldingWith(rawRules, ['biogaz'])).toEqual({
			biogaz: {
				valeur: '(10 * 20) + not foldable',
				optimized: 'partially',
			},
			'not foldable': {
				question: 'The user needs to provide a value.',
			},
		})
	})

	it('replaceAllRefs bug #2', () => {
		const rawRules = {
			boisson: {
				valeur: 'tasse de café * nombre',
			},
			'boisson . tasse de café': {
				valeur: 20,
			},
			'boisson . nombre': {
				'par défaut': 10,
			},
		}
		expect(constantFoldingWith(rawRules, ['boisson'])).toEqual({
			boisson: {
				valeur: '20 * nombre',
				optimized: 'partially',
			},
			'boisson . nombre': {
				'par défaut': 10,
			},
		})
	})

	it('should fold standalone [valeur] rule', () => {
		const rawRules = {
			boisson: 'tasse de café * nombre',
			'boisson . tasse de café': {
				valeur: 20,
			},
			'boisson . nombre': {
				'par défaut': 10,
			},
		}
		expect(constantFoldingWith(rawRules, ['boisson'])).toEqual({
			boisson: {
				valeur: '20 * nombre',
				optimized: 'partially',
			},
			'boisson . nombre': {
				'par défaut': 10,
			},
		})
	})

	it('should keeps % when folding', () => {
		const rawRules = {
			boisson: 'pct * nombre',
			'boisson . pct': {
				valeur: '2%',
			},
			'boisson . nombre': {
				'par défaut': 10,
			},
		}
		expect(constantFoldingWith(rawRules, ['boisson'])).toEqual({
			boisson: {
				valeur: '2 % * nombre',
				optimized: 'partially',
			},
			'boisson . nombre': {
				'par défaut': 10,
			},
		})
	})

	it('par défaut = 0', () => {
		const rawRules = {
			'chocolat chaud': {
				valeur: 'tasse de chocolat chaud * nombre',
			},
			'tasse de chocolat chaud': {
				valeur: 20.3,
			},
			'chocolat chaud . nombre': {
				question: 'Nombre de chocolats chauds par semaine',
				'par défaut': 0,
			},
		}
		expect(constantFoldingWith(rawRules, ['chocolat chaud'])).toEqual({
			'chocolat chaud': {
				valeur: '20.3 * nombre',
				optimized: 'partially',
			},
			'chocolat chaud . nombre': {
				question: 'Nombre de chocolats chauds par semaine',
				'par défaut': 0,
			},
		})
	})

	it('should replace constant ref, even if it starts with diacritic', () => {
		const rawRules = {
			piscine: {
				icônes: '🏠🏊',
			},
			'piscine . empreinte': {
				valeur: { somme: ['équipés * nombre * équipés * équipés'] },
			},
			'piscine . nombre': { question: 'Combien ?', 'par défaut': 2 },
			'piscine . équipés': { valeur: 45 },
		}
		expect(constantFoldingWith(rawRules, ['piscine . empreinte'])).toEqual({
			'piscine . empreinte': {
				somme: ['((45 * nombre) * 45) * 45'],
				optimized: 'partially',
			},
			'piscine . nombre': { question: 'Combien ?', 'par défaut': 2 },
		})
	})

	it('should work with parentheses inside [valeur]', () => {
		const rawRules = {
			'divers . ameublement . meubles . armoire . empreinte amortie': {
				titre: 'Empreinte armoire amortie',
				valeur: 'armoire . empreinte / (durée * coefficient préservation)',
				unité: 'kgCO2e',
			},
			'divers . ameublement . meubles . armoire . coefficient préservation': 45,
			'divers . ameublement . meubles . armoire . durée': 10,
			'divers . ameublement . meubles . armoire . empreinte': {
				question: 'Empreinte?',
			},
		}
		expect(
			constantFoldingWith(rawRules, [
				'divers . ameublement . meubles . armoire . empreinte amortie',
			]),
		).toEqual({
			'divers . ameublement . meubles . armoire . empreinte amortie': {
				titre: 'Empreinte armoire amortie',
				valeur: 'armoire . empreinte / (10 * 45)',
				unité: 'kgCO2e',
				optimized: 'partially',
			},
			'divers . ameublement . meubles . armoire . empreinte': {
				question: 'Empreinte?',
			},
		})
	})

	it('should not fold rules impacted by a [contexte] with a question in dependency', () => {
		const rawRules = {
			root: {
				valeur: 'rule to recompute',
				contexte: {
					constant: 20,
				},
			},
			'rule to recompute': {
				valeur: '(constant * 2) * question',
			},
			question: {
				question: 'Question ?',
			},
			constant: {
				valeur: 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual(rawRules)
	})

	it('should fold constant rules used in a [contexte]', () => {
		const rawRules = {
			root: {
				valeur: 'rule to recompute',
				contexte: {
					'rule to replace': 'constant',
				},
			},
			'rule to recompute': {
				valeur: '(rule to replace * 2) * question',
			},
			'rule to replace': {
				valeur: 0,
			},
			question: {
				question: 'Question ?',
			},
			constant: {
				valeur: 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual({
			root: {
				valeur: 'rule to recompute',
				contexte: {
					'rule to replace': 10,
				},
				optimized: 'partially',
			},
			'rule to recompute': {
				valeur: '(rule to replace * 2) * question',
			},
			'rule to replace': {
				valeur: 0,
			},
			question: {
				question: 'Question ?',
			},
		})
	})

	it('should fold rules impacted by a [] with multiple contexte rules', () => {
		const rawRules = {
			root: {
				valeur: 'rule to recompute',
				contexte: {
					constant: 50,
					'constant 2': 100,
				},
			},
			'rule to recompute': {
				valeur: 'constant * 2 + constant 2',
			},
			constant: {
				valeur: 10,
			},
			'constant 2': {
				valeur: 15,
			},
		}
		expect(
			constantFoldingWith(rawRules, ['root', 'rule to recompute']),
		).toEqual({
			root: {
				valeur: 200,
				optimized: 'fully',
			},
			'rule to recompute': {
				valeur: 35,
				optimized: 'fully',
			},
		})
	})

	it('should not fold nested rules (2 deep) impacted by a [contexte]', () => {
		const rawRules = {
			root: {
				valeur: 'rule to recompute',
				contexte: {
					constant: 20,
				},
			},
			'rule to recompute': {
				valeur: 'nested 1 * 2',
			},
			'rule to recompute . nested 1': {
				valeur: 'nested 2 * 4',
			},
			'rule to recompute . nested 2': {
				valeur: 'nested 3 * 4',
			},
			'rule to recompute . nested 3': {
				valeur: '(constant * 4) * question',
			},
			question: {
				question: 'Question ?',
			},
			constant: {
				valeur: 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual(rawRules)
	})

	it('should not fold rules impacted by a [contexte] with nested mechanisms in the formula', () => {
		const rawRules = {
			root: {
				somme: ['rule to recompute', 'question', 10],
				contexte: {
					constant: 20,
				},
			},
			'rule to recompute': {
				valeur: 'constant * 2',
			},
			question: {
				question: 'Question ?',
			},
			constant: {
				valeur: 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual(rawRules)
	})

	it('should fold rules impacted by a [contexte] with nested mechanisms in the formula', () => {
		const rawRules = {
			root: {
				somme: ['rule to recompute', 'question', 10],
				contexte: {
					constant: 20,
				},
			},
			'rule to recompute': {
				valeur: 'constant * 2 * foldable',
			},
			question: {
				question: 'Question ?',
			},
			constant: {
				valeur: 10,
			},
			foldable: {
				valeur: 15,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual({
			root: {
				somme: ['rule to recompute', 'question', 10],
				contexte: {
					constant: 20,
				},
			},
			'rule to recompute': {
				valeur: '(constant * 2) * 15',
				optimized: 'partially',
			},
			question: {
				question: 'Question ?',
			},
			constant: {
				valeur: 10,
			},
		})
	})

	it('should fold a constant rule even with [contexte]', () => {
		const rawRules = {
			root: {
				valeur: 'rule to recompute',
				contexte: {
					constant: 15,
				},
			},
			'rule to recompute': {
				valeur: 'constant * 2',
			},
			'rule to fold': {
				valeur: 'constant * 4',
			},
			constant: {
				valeur: 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual({
			root: {
				valeur: 30,
				optimized: 'fully',
			},
			'rule to fold': {
				valeur: 40,
				optimized: 'fully',
			},
		})
	})

	it('should not fold a nullable constant [contexte] rule', () => {
		const rawRules = {
			root: {
				'applicable si': 'présent',
			},
			'root . présent': {
				question: 'Is present?',
				'par défaut': 'non',
			},
			'root . a': {
				valeur: 'rule to recompute',
				contexte: {
					constant: 15,
				},
			},
			'rule to recompute': {
				valeur: 'constant * 2',
			},
			'rule to fold': {
				valeur: 'constant * 4',
			},
			constant: {
				valeur: 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual(rawRules)
	})

	it('replaceAllRefs bug #3', () => {
		const rawRules = {
			boisson: {
				valeur: 'tasse de café * café',
			},
			'boisson . café': {
				valeur: 20,
			},
			'boisson . tasse de café': {
				question: '?',
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual({
			boisson: {
				valeur: 'tasse de café * 20',
				optimized: 'partially',
			},
			'boisson . tasse de café': {
				question: '?',
			},
		})
	})

	it('should fold a unit rule with a constant [unité]', () => {
		const rawRules = {
			root: {
				formule: '14 repas/semaine * plats . végétalien . empreinte',
				unité: 'kgCO2e/semaine',
			},
			'plats . végétalien . empreinte': {
				titre: "Empreinte d'un repas végétalien",
				formule: 0.785,
				unité: 'kgCO2e/repas',
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual({
			root: {
				valeur: '10.99 kgCO2e/semaine',
				unité: 'kgCO2e/semaine',
				optimized: 'fully',
			},
		})
	})

	it('should fold a constant within two degrees with an [applicable si] (set to false) mechanism', () => {
		const rawRules = {
			A: {
				valeur: 'B',
			},
			'A . B': {
				'applicable si': 'présent',
				valeur: 'C * 10',
			},
			'A . B . présent': {
				question: 'Is present?',
				'par défaut': 'non',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual(rawRules)
	})

	it('should fold a constant within two degrees with an [applicable si] (set to true) mechanism', () => {
		const rawRules = {
			A: {
				valeur: 'B',
			},
			'A . B': {
				'applicable si': 'présent',
				valeur: 'C * 10',
			},
			'A . B . présent': {
				question: 'Is present?',
				'par défaut': 'oui',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual(rawRules)
	})

	it('should not delete leaf used in [applicable si > toutes ces conditions (evaluated to ⊤)]', () => {
		const rawRules = {
			root: {
				'applicable si': {
					'toutes ces conditions': ['unfoldable < foldable'],
				},
				valeur: 'foldable * unfoldable',
			},
			'root . foldable': {
				valeur: 20,
			},
			'root . unfoldable': {
				'par défaut': 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual(rawRules)
	})

	it('should not delete leaf used in [applicable si > toutes ces conditions (evaluated to ⊥)] ', () => {
		const rawRules = {
			root: {
				'applicable si': {
					'toutes ces conditions': ['unfoldable > foldable'],
				},
				valeur: 'foldable * unfoldable',
			},
			'root . foldable': {
				valeur: 20,
			},
			'root . unfoldable': {
				'par défaut': 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual(rawRules)
	})

	it('should not fold nullable rules evaluated to null in the default situation', () => {
		const rawRules = {
			A: {
				valeur: 'B . C',
			},
			'A . B': {
				'applicable si': 'présent',
				valeur: 'C * 10',
			},
			'A . B . présent': {
				question: 'Is present?',
				'par défaut': 'non',
			},
			// nullable rule
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual(rawRules)
	})

	it('should not fold nullable rules evaluated not to null in the default situation', () => {
		const rawRules = {
			A: {
				valeur: 'B . C',
			},
			'A . B': {
				'applicable si': 'présent',
				valeur: 'C * 10',
			},
			'A . B . présent': {
				question: 'Is present?',
				'par défaut': 'oui',
			},
			// nullable rule
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual(rawRules)

		// TODO: fine tune the conditional applicability fold
		// {
		//   A: {
		//     'applicable si': 'A . B . présent',
		//     valeur: 7,
		//     optimized: 'partially',
		//   },
		//   'A . B': {
		//     'applicable si': 'présent',
		//     valeur: '7 * 10',
		//     optimized: 'partially',
		//   },
		//   'A . B . présent': {
		//     question: 'Is present?',
		//     'par défaut': 'oui',
		//   },
		// }))
	})

	it('should not fold rules used in a [remplacement]', () => {
		const rawRules = {
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
		expect(constantFoldingWith(rawRules)).toEqual({
			...rawRules,
			'cafés-restaurants': {
				valeur: 'oui',
				optimized: 'fully',
			},
		})
	})

	it('should not fold rules used in a [remplacement] with a specified context', () => {
		const rawRules = {
			foo: {
				valeur: 0,
			},
			'foo remplacé dans résultat 1': {
				remplace: {
					'références à': 'foo',
					priorité: 2,
					dans: ['résultat 1'],
				},
				valeur: 2,
			},
			'foo remplacé dans résultat 2': {
				'applicable si': 'non',
				remplace: {
					'références à': 'foo',
					'sauf dans': ['résultat 1'],
				},
				valeur: 3,
			},
			'résultat 1': { valeur: 'foo' },
			'résultat 2': { valeur: 'foo' },
		}
		expect(constantFoldingWith(rawRules)).toEqual({ ...rawRules })
	})

	it('should fully fold a rule with [syntaxic sugar]', () => {
		const rawRules = {
			foo: {
				somme: ['bar', 'baz'],
			},
			'foo 2': {
				produit: ['bar', 'baz'],
			},
			bar: {
				valeur: 10,
			},
			baz: {
				valeur: 20,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual({
			foo: {
				valeur: 30,
				optimized: 'fully',
			},
			'foo 2': {
				valeur: 200,
				optimized: 'fully',
			},
		})
	})

	it('should fold [private rule]', () => {
		const rawRules = {
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
			foo: {
				privé: 'oui',
				'par défaut': 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual({
			cotisation: {
				optimized: 'fully',
				valeur: '58.8 €',
			},
			foo: {
				privé: 'oui',
				'par défaut': 10,
			},
		})
	})

	it('should keep rules from [une possibilité] within [avec]', () => {
		const rawRules = {
			a: {
				avec: { b: null, c: null },
				'une possibilité': ['b', 'c'],
				'par défaut': "'b'",
			},
		}
		expect(constantFoldingWith(rawRules)).toEqual({
			a: {
				'une possibilité': ['b', 'c'],
				'par défaut': "'b'",
			},
			'a . b': null,
			'a . c': null,
		})
	})

	it('should keep rules from [une possibilité] or empty', () => {
		const rawRules = {
			a: {
				'une possibilité': ['b', 'c'],
				'par défaut': "'b'",
			},
			b: {},
			c: {},
		}
		expect(constantFoldingWith(rawRules)).toEqual({
			a: {
				'une possibilité': ['b', 'c'],
				'par défaut': "'b'",
			},
			b: null,
			c: null,
		})
	})
})
