import { getRawNodes, RuleName, RawRules } from '../src/commons'

import constantFolding from '../src/constantFolding'

import { callWithEngine } from './utils.test'

function constantFoldingWith(
	rawRules: RawRules,
	targets?: RuleName[]
): RawRules {
	const res = callWithEngine(
		(engine) => constantFolding(engine, targets),
		rawRules
	)
	return getRawNodes(res)
}

describe('Constant folding optim', () => {
	it('∅ -> ∅', () => {
		expect(constantFoldingWith({})).toStrictEqual({})
	})
	it('should remove empty nodes', () => {
		expect(
			constantFoldingWith({
				ruleA: null,
				ruleB: {
					formule: '10 * 10',
				},
			})
		).toStrictEqual({
			ruleB: {
				valeur: '100',
				'est compressée': true,
			},
		})
	})
	it('should replace a [formule] with 1 dependency with the corresponding constant value', () => {
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
				valeur: '30',
				'est compressée': true,
			},
		})
	})
	it('should replace a [formule] with 2 dependencies with the corresponding constant value', () => {
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
				valeur: '30',
				'est compressée': true,
			},
		})
	})
	it('should replace the constant reference without being able to fold entirely the rule', () => {
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
	it('should partially fold rule with constant with multiple parents dependencies', () => {
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
				// TODO: could be '30' instead of '10 * 3'
				formule: '10 * 3',
				'est compressée': true,
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
		expect(constantFoldingWith(rawRules, ['ruleA'])).toStrictEqual({
			ruleA: {
				titre: 'Rule A',
				formule: '10 * D',
				'est compressée': true,
			},
			'ruleA . D': {
				question: "What's the value of D?",
			},
		})
	})
	it('should fold a constant within _two degrees_', () => {
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
		expect(constantFoldingWith(rawRules, ['A'])).toStrictEqual({
			A: {
				valeur: '70',
				'est compressée': true,
			},
		})
	})
	it('should fold constant within two degrees with B, a partially foldable rule', () => {
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
				valeur: '70',
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
	it('should completely fold a [somme] mechanism', () => {
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
		expect(constantFoldingWith(rawRules, ['ruleA'])).toStrictEqual({
			ruleA: {
				valeur: '174',
				'est compressée': true,
			},
		})
	})
	it('should partially fold a [somme] mechanism', () => {
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
	it('should partially fold [formule > somme] mechanism', () => {
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
	// it('should fold [formule > variations] mechanism', () => {
	// 	fail('TODO')
	// })
	it('should fold a mutiple [somme] deep dependencies', () => {
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
		expect(constantFoldingWith(rawRules, ['omr'])).toStrictEqual({
			omr: {
				valeur: '0.69068',
				'est compressée': true,
			},
		})
	})
	it('should replace properly child rule references when one is a substring of the other: (Ambiguity with rule name)', () => {
		const rawRules = {
			biogaz: {
				formule:
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
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			biogaz: {
				formule: '20 * 10 + not foldable',
				'est compressée': true,
			},
			'not foldable': {
				question: 'The user needs to provide a value.',
			},
		})
	})
	it('replaceAllRefs bug #2', () => {
		const rawRules = {
			boisson: {
				formule: 'tasse de café * nombre',
			},
			'boisson . tasse de café': {
				valeur: 20,
			},
			'boisson . nombre': {
				'par défaut': 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			boisson: {
				formule: '20 * nombre',
				'est compressée': true,
			},
			'boisson . nombre': {
				'par défaut': 10,
			},
		})
	})
	it('should fold standalone [formule] rule', () => {
		const rawRules = {
			boisson: 'tasse de café * nombre',
			'boisson . tasse de café': {
				valeur: 20,
			},
			'boisson . nombre': {
				'par défaut': 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			boisson: {
				formule: '20 * nombre',
				'est compressée': true,
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
				formule: '2%',
			},
			'boisson . nombre': {
				'par défaut': 10,
			},
		}
		expect(constantFoldingWith(rawRules)).toStrictEqual({
			boisson: {
				formule: '2% * nombre',
				'est compressée': true,
			},
			'boisson . nombre': {
				'par défaut': 10,
			},
		})
	})
	//
	//
	// TODO: not supported yet
	//
	//
	// it('should fold a constant within two degrees with an [applicable si] (set to false) mechanism', () => {
	// 	const rawRules = {
	// 		A: {
	// 			formule: 'B',
	// 		},
	// 		'A . B': {
	// 			'applicable si': 'présent',
	// 			formule: 'C * 10',
	// 		},
	// 		'A . B . présent': {
	// 			question: 'Is present?',
	// 			'par défaut': 'non',
	// 		},
	// 		'A . B . C': {
	// 			valeur: 7,
	// 		},
	// 	}
	// 	expect(constantFoldingWith(rawRules)).toStrictEqual({
	// 		A: {
	// 			formule: 'B',
	// 		},
	// 		'A . B': {
	// 			'applicable si': 'présent',
	// 			formule: '7 * 10',
	// 			'est compressée': true,
	// 		},
	// 		'A . B . présent': {
	// 			question: 'Is present?',
	// 			'par défaut': 'non',
	// 		},
	// 	})
	// })
	// it('should fold a constant within two degrees with an [applicable si] (set to true) mechanism', () => {
	// 	const rawRules = {
	// 		A: {
	// 			formule: 'B',
	// 		},
	// 		'A . B': {
	// 			'applicable si': 'présent',
	// 			formule: 'C * 10',
	// 		},
	// 		'A . B . présent': {
	// 			question: 'Is present?',
	// 			'par défaut': 'oui',
	// 		},
	// 		'A . B . C': {
	// 			valeur: 7,
	// 		},
	// 	}
	// 	expect(constantFoldingWith(rawRules)).toStrictEqual({
	// 		A: {
	// 			formule: 'B',
	// 		},
	// 		'A . B': {
	// 			'applicable si': 'présent',
	// 			formule: '7 * 10',
	// 			'est compressée': true,
	// 		},
	// 		'A . B . présent': {
	// 			question: 'Is present?',
	// 			'par défaut': 'oui',
	// 		},
	// 	})
	// })
	//
	// it('should not delete leaf used in [applicable si > toutes ces conditions (evaluated to ⊤)]', () => {
	// 	const rawRules = {
	// 		root: {
	// 			'applicable si': {
	// 				'toutes ces conditions': ['unfoldable < foldable'],
	// 			},
	// 			formule: 'foldable * pas foldable',
	// 		},
	// 		'root . foldable': {
	// 			valeur: 20,
	// 		},
	// 		'root . unfoldable': {
	// 			'par défaut': 10,
	// 		},
	// 	}
	// 	expect(constantFoldingWith(rawRules)).toStrictEqual({
	// 		root: {
	// 			'applicable si': {
	// 				// TODO: should be replaced by 'unfoldable < 20'
	// 				'toutes ces conditions': ['unfoldable < foldable'],
	// 			},
	// 			formule: '20 * unfoldable',
	// 			'est compressée': true,
	// 		},
	// 		'root . unfoldable': {
	// 			'par défaut': 10,
	// 		},
	// 	})
	// })
	// it('should not delete leaf used in [applicable si > toutes ces conditions (evaluated to ⊥)] ', () => {
	// 	const rawRules = {
	// 		root: {
	// 			'applicable si': {
	// 				'toutes ces conditions': ['unfoldable > foldable'],
	// 			},
	// 			formule: 'foldable * unfoldable',
	// 		},
	// 		'root . foldable': {
	// 			valeur: 20,
	// 		},
	// 		'root . unfoldable': {
	// 			'par défaut': 10,
	// 		},
	// 	}
	// 	expect(constantFoldingWith(rawRules)).toStrictEqual({
	// 		root: {
	// 			'applicable si': {
	// 				'toutes ces conditions': ['unfoldable > 20'],
	// 			},
	// 			formule: '20 * unfoldable',
	// 			'est compressée': true,
	// 		},
	// 		'root . unfoldable': {
	// 			'par défaut': 10,
	// 		},
	// 	})
	// })
	// TODO:
	// it('replaceAllRefs bug #3', () => {
	// 	const rawRules = {
	// 		boisson: {
	// 			formule: 'tasse de café * café',
	// 		},
	// 		'boisson . café': {
	// 			valeur: 20,
	// 		},
	// 		'boisson . tasse de café': {
	// 			'par défaut': 10,
	// 		},
	// 	}
	// 	expect(constantFoldingWith(rawRules)).toStrictEqual({
	// 		boisson: {
	// 			formule: 'tasse de café * 20',
	// 			'est compressée': true,
	// 		},
	// 		'boisson . nombre': {
	// 			'par défaut': 10,
	// 		},
	// 	})
	// })
})
