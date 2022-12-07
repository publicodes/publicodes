import { getRawNodes } from '../src/commons'
import type { RawRules } from '../src/commons'

import constantFolding from '../src/constantFolding'

import { callWithEngine } from './utils.test'

function constantFoldingWith(rawRules: RawRules): RawRules {
	const res = callWithEngine(constantFolding, rawRules)
	return getRawNodes(res)
}

describe('Constant folding optim', () => {
	it('∅ -> ∅', () => {
		expect(constantFoldingWith({})).toStrictEqual({})
	})
	it('Should remove empty nodes', () => {
		expect(
			constantFoldingWith({
				ruleA: null,
				ruleB: {
					formule: '10 * 10',
				},
			})
		).toStrictEqual({
			ruleB: {
				valeur: 100,
				'est compressée': true,
			},
		})
	})
	it('Referenced constant should be replaced - [1 dependency]', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				formule: 'B . C * 3',
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			ruleA: {
				titre: 'Rule A',
				valeur: 30,
				'est compressée': true,
			},
		})
	})
	it('Referenced constant should be replaced - [2 dependency]', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				formule: 'B . C * D',
			},
			'ruleA . B . C': {
				valeur: '10',
			},
			'ruleA . D': {
				valeur: '3',
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			ruleA: {
				titre: 'Rule A',
				valeur: 30,
				'est compressée': true,
			},
		})
	})
	it('Partially compressible rule', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				formule: 'B . C * D',
			},
			'ruleA . D': {
				question: "What's the value of D",
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			ruleA: {
				titre: 'Rule A',
				formule: '10 * D',
				'est compressée': true,
			},
			'ruleA . D': {
				question: "What's the value of D",
			},
		})
	})
	it('Partially compressible rule with constant with mutliple dependencies', () => {
		const rawRules = {
			ruleA: {
				titre: 'Rule A',
				formule: 'B . C * D',
			},
			ruleB: {
				formule: 'ruleA . B . C * 3',
			},
			'ruleA . D': {
				question: "What's the value of D?",
			},
			'ruleA . B . C': {
				valeur: '10',
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			ruleA: {
				titre: 'Rule A',
				formule: '10 * D',
				'est compressée': true,
			},
			ruleB: {
				valeur: 30,
				'est compressée': true,
			},
			'ruleA . D': {
				question: "What's the value of D?",
			},
		})
	})
	it('A is a constant within two degrees', () => {
		const rawRules = {
			A: {
				formule: 'B',
			},
			'A . B': {
				formule: 'C * 10',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			A: {
				valeur: 70,
				'est compressée': true,
			},
		})
	})
	it("A is a constant within two degrees with a 'applicable si' (set to false) mechanism", () => {
		const rawRules = {
			A: {
				formule: 'B',
			},
			'A . B': {
				'applicable si': 'présent',
				formule: 'C * 10',
			},
			'A . B . présent': {
				question: 'Is present?',
				'par défaut': 'non',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			A: {
				formule: 'B',
			},
			'A . B': {
				'applicable si': 'présent',
				formule: '7 * 10',
				'est compressée': true,
			},
			'A . B . présent': {
				question: 'Is present?',
				'par défaut': 'non',
			},
		})
	})
	it("A is a constant within two degrees with a 'applicable si' (set to true) mechanism", () => {
		const rawRules = {
			A: {
				formule: 'B',
			},
			'A . B': {
				'applicable si': 'présent',
				formule: 'C * 10',
			},
			'A . B . présent': {
				question: 'Is present?',
				'par défaut': 'oui',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			A: {
				formule: 'B',
			},
			'A . B': {
				'applicable si': 'présent',
				formule: '7 * 10',
				'est compressée': true,
			},
			'A . B . présent': {
				question: 'Is present?',
				'par défaut': 'oui',
			},
		})
	})
	it('A is a constant within two degrees plus B is a partially foldable rule', () => {
		const rawRules = {
			A: {
				formule: 'B',
			},
			B: {
				formule: 'A . B * D',
			},
			'B . D': {
				question: "What's the value of B . D?",
			},
			'A . B': {
				formule: 'C * 10',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			A: {
				valeur: 70,
				'est compressée': true,
			},
			B: {
				formule: '70 * D',
				'est compressée': true,
			},
			'B . D': {
				question: "What's the value of B . D?",
			},
		})
	})
	it("Mechanism: 'somme' [complete folding]", () => {
		const rawRules = {
			ruleA: {
				formule: 'ruleB',
			},
			ruleB: {
				somme: ['A . B * 2', 10, 12 * 2],
			},
			'A . B': {
				formule: 'C * 10',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			ruleA: {
				valeur: 174,
				'est compressée': true,
			},
		})
	})
	it("Mechanism: 'somme' [partial folding]", () => {
		const rawRules = {
			ruleA: {
				formule: 'ruleB',
			},
			ruleB: {
				somme: ['A . B * D', 10, 12 * 2],
			},
			'ruleB . D': {
				question: "What's the value of ruleB . D?",
			},
			'A . B': {
				formule: 'C * 10',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			ruleA: {
				formule: 'ruleB',
			},
			ruleB: {
				somme: ['70 * D', 10, 24],
				'est compressée': true,
			},
			'ruleB . D': {
				question: "What's the value of ruleB . D?",
			},
		})
	})
	it("Mechanism: 'somme' inside 'formule' [partial folding]", () => {
		const rawRules = {
			ruleA: {
				formule: 'ruleB',
			},
			ruleB: {
				formule: {
					somme: ['A . B * D', 10, 12 * 2],
				},
			},
			'ruleB . D': {
				question: "What's the value of ruleB . D?",
			},
			'A . B': {
				formule: 'C * 10',
			},
			'A . B . C': {
				valeur: 7,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			ruleA: {
				formule: 'ruleB',
			},
			ruleB: {
				formule: {
					somme: ['70 * D', 10, 24],
				},
				'est compressée': true,
			},
			'ruleB . D': {
				question: "What's the value of ruleB . D?",
			},
		})
	})
	it("Mutiple 'somme' deep dependencies", () => {
		const rawRules = {
			omr: {
				formule: {
					somme: ['omr . putrescibles', 'omr . papier carton'],
				},
			},
			'omr . putrescibles': {
				formule: {
					somme: ['stockage', 'incinération'],
				},
			},
			'omr . putrescibles . stockage': {
				formule: 'stockage . pourcentage * stockage . impact',
				unité: 'kgCO2e',
			},
			'omr . putrescibles . stockage . pourcentage': {
				formule: '24%',
			},
			'omr . putrescibles . stockage . impact': {
				formule: 0.692,
				unité: 'kgCO2e/kg',
			},
			'omr . putrescibles . incinération': {
				formule: 'incinération . pourcentage * incinération . impact',
				unité: 'kgCO2e',
			},
			'omr . putrescibles . incinération . pourcentage': {
				formule: '68%',
			},
			'omr . putrescibles . incinération . impact': {
				formule: 0.045,
				unité: 'kgCO2e/kg',
			},
			'omr . papier carton': {
				formule: {
					somme: ['stockage', 'incinération'],
				},
			},
			'omr . papier carton . stockage': {
				formule: 'stockage . pourcentage * stockage . impact',
			},
			'omr . papier carton . stockage . pourcentage': {
				formule: '26%',
			},
			'omr . papier carton . stockage . impact': {
				formule: 0.95,
			},
			'omr . papier carton . incinération': {
				formule: 'incinération . pourcentage * incinération . impact',
			},
			'omr . papier carton . incinération . pourcentage': {
				formule: '26%',
			},
			'omr . papier carton . incinération . impact': {
				formule: 0.95,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			omr: {
				valeur: 0.69068,
				'est compressée': true,
			},
		})
	})
})
