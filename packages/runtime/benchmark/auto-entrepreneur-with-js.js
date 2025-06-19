import { run, bench, summary, do_not_optimize } from 'mitata'
import LegacyEngine from 'publicodes'

// New engine
import NewEngine from '../dist/index.js'

import NewEngineJS from '../test/auto-entrepreneur/js-output/engine.js'
// import NewEngineJSWithCache from '../test/auto-entrepreneur/js-output/engine-with-cache.js'
// import { rules as jsRules } from '../test/auto-entrepreneur/js-output/only-rules.js'
// import { rules as jsRulesOptim } from '../test/auto-entrepreneur/js-output/only-rules-w-optim.js'

// Test data imports
import autoEntrepreneurNewRules from '../test/auto-entrepreneur/model.publicodes.json' assert { type: 'json' }
import autoEntrepreneurLegacyRules from '../test/auto-entrepreneur/legacy-build/index.js'

console.log('🚀 Publicodes Engine Benchmark - auto-entrepreneur modèle \n')

// Auto-entrepreneur Model Benchmarks
summary(() => {
	bench('[Auto-entrepreneur instantiation] Publicodes 1', () => {
		return new LegacyEngine(autoEntrepreneurLegacyRules)
	})

	bench('[Auto-entrepreneur instantiation] Publicodes 2', () => {
		return do_not_optimize(new NewEngine(autoEntrepreneurNewRules))
	})

	// bench(
	// 	'[Auto-entrepreneur instantiation] Publicodes 2 JS (only-rules)',
	// 	() => {
	// 		return jsRules
	// 	},
	// )

	bench('[Auto-entrepreneur instantiation] Publicodes 2 (JS)', () => {
		return do_not_optimize(new NewEngineJS())
	})

	// bench(
	// 	'[Auto-entrepreneur instantiation] Publicodes 2 JS (with cache)',
	// 	() => {
	// 		return do_not_optimize(new NewEngineJSWithCache())
	// 	},
	// )
})

const situationBuilder = ({ legacy }) => ({
	"entreprise . chiffre d'affaires . BIC": 0,
	"entreprise . chiffre d'affaires . service BIC": 10000,
	"entreprise . chiffre d'affaires . service BNC": 0,
	"entreprise . chiffre d'affaires . vente restauration hébergement": 0,
	'entreprise . activité . nature': legacy ? "'libérale'" : 'libérale',
	'entreprise . activité . nature . libérale . réglementée':
		legacy ? 'non' : false,
	date: legacy ? '20/05/2025' : new Date('2025-05-20'),
	'dirigeant . auto-entrepreneur . Cipav . adhérent': legacy ? 'non' : false,
})

const situation = situationBuilder({ legacy: true })
const contexte = situationBuilder({ legacy: false })

summary(() => {
	const newEngineAE = new NewEngine(autoEntrepreneurNewRules)
	const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)
	const newEngineJs = new NewEngineJS()
	// const newEngineJsWithCache = new NewEngineJSWithCache(undefined)

	bench('[Evaluation cache reset] Publicodes 1', () => {
		legacyEngineAE.setSituation(situation)
		return legacyEngineAE.evaluate('dirigeant . auto-entrepreneur . revenu net')
	})

	// Auto-entrepreneur model evaluations
	bench('[Evaluation without cache] Publicodes 2', () => {
		return newEngineAE.evaluate(
			'dirigeant . auto-entrepreneur . revenu net',
			contexte,
		)
	})

	// bench('[Evaluation without cache] Publicodes 2 JS (only-rules)', () => {
	// 	return jsRules['dirigeant . auto-entrepreneur . revenu net'](contexte)
	// })

	bench('[Evaluation without cache] Publicodes 2 (JS)', () => {
		return newEngineJs.evaluate(
			'dirigeant . auto-entrepreneur . revenu net',
			contexte,
		)
	})

	// bench('[Evaluation without cache] Publicodes 2 JS (with cache)', () => {
	// 	return newEngineJsWithCache.evaluate(
	// 		'dirigeant . auto-entrepreneur . revenu net',
	// 		contexte,
	// 	)
	// })
})

summary(() => {
	const newEngineAE = new NewEngine(autoEntrepreneurNewRules, { cache: true })
	const newEngineAEWithoutCache = new NewEngine(autoEntrepreneurNewRules, {
		cache: false,
	})
	const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)
	const newEngineJs = new NewEngineJS()
	const newEngineJsWithCache = new NewEngineJS(true)

	legacyEngineAE.setSituation(situation)
	bench('[Same evaluation repeated] Publicodes 1', () => {
		return legacyEngineAE.evaluate('dirigeant . auto-entrepreneur . revenu net')
	})

	// Auto-entrepreneur model evaluations
	bench('[Same evaluation repeated] Publicodes 2 (no cache)', () => {
		return newEngineAEWithoutCache.evaluate(
			'dirigeant . auto-entrepreneur . revenu net',
			contexte,
		)
	})

	// Auto-entrepreneur model evaluations
	bench('[Same evaluation repeated] Publicodes 2 (cache)', () => {
		return newEngineAE.evaluate(
			'dirigeant . auto-entrepreneur . revenu net',
			contexte,
		)
	})

	// bench('[Same evaluation repeated] Publicodes 2 JS (only-rules)', () => {
	// 	return jsRules['dirigeant . auto-entrepreneur . revenu net'](contexte)
	// })

	bench('[Same evaluation repeated] Publicodes 2 (JS)', () => {
		return newEngineJs.evaluate(
			'dirigeant . auto-entrepreneur . revenu net',
			contexte,
		)
	})

	bench('[Same evaluation repeated] Publicodes 2 JS (with cache)', () => {
		return newEngineJsWithCache.evaluate(
			'dirigeant . auto-entrepreneur . revenu net',
			contexte,
		)
	})
})

const rules = [
	'dirigeant . auto-entrepreneur . revenu net',
	'entreprise . activité . nature',
	'dirigeant . auto-entrepreneur . cotisations et contributions',
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC',
	"entreprise . chiffre d'affaires",
]

// Complex scenario benchmarks for auto-entrepreneur
summary(() => {
	const newEngineAEWithCache = new NewEngine(autoEntrepreneurNewRules, {
		cache: true,
	})
	bench(
		'[Multiple rules evaluated first eval] Publicodes 2 (cache between rule eval)',
		() => {
			const results = []
			const newContexte = Object.assign({}, contexte)
			rules.forEach((rule) => {
				results.push(newEngineAEWithCache.evaluate(rule, newContexte))
			})
			return results
		},
	)

	const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)
	bench('[Multiple rules evaluated first eval] Publicodes 1', () => {
		legacyEngineAE.setSituation(situation)
		const results = []
		rules.forEach((rule) => {
			results.push(legacyEngineAE.evaluate(rule))
		})
		return results
	})

	const newEngineAEWithoutCache = new NewEngine(autoEntrepreneurNewRules, {
		cache: false,
	})

	bench('[Multiple rules evaluated first eval] Publicodes 2 (no cache)', () => {
		const results = []
		const newContexte = Object.assign({}, contexte)
		rules.forEach((rule) => {
			results.push(newEngineAEWithoutCache.evaluate(rule, newContexte))
		})
		return results
	})

	// bench(
	// 	'[Multiple rules evaluated first eval] Publicodes 2 JS (only-rules)',
	// 	() => {
	// 		const results = []
	// 		const newContexte = Object.assign({}, contexte)
	// 		rules.forEach((rule) => {
	// 			results.push(jsRules[rule](newContexte))
	// 		})
	// 		return results
	// 	},
	// )

	// bench(
	// 	'[Multiple rules evaluated first eval] Publicodes 2 JS (only-rules optim)',
	// 	() => {
	// 		const results = []
	// 		const newContexte = Object.assign({}, contexte)
	// 		rules.forEach((rule) => {
	// 			results.push(jsRulesOptim[rule](newContexte))
	// 		})
	// 		return results
	// 	},
	// )

	const newEngineJs = new NewEngineJS()

	bench('[Multiple rules evaluated first eval] Publicodes 2 (JS)', () => {
		const results = []
		const newContexte = Object.assign({}, contexte)
		rules.forEach((rule) => {
			results.push(newEngineJs.evaluate(rule, newContexte))
		})
		return results
	})

	const newEngineJsWithCache = new NewEngineJS(true)

	bench(
		'[Multiple rules evaluated first eval] Publicodes 2 JS (with cache)',
		() => {
			const results = []
			const newContexte = Object.assign({}, contexte)
			rules.forEach((rule) => {
				results.push(newEngineJsWithCache.evaluate(rule, newContexte))
			})
			return results
		},
	)
})

// Complex scenario benchmarks for auto-entrepreneur
summary(() => {
	const newEngineAEWithCache = new NewEngine(autoEntrepreneurNewRules, {
		cache: true,
	})
	const changes = {
		"entreprise . chiffre d'affaires . service BNC": 10000,
		"entreprise . chiffre d'affaires . service BIC": 10000,
	}

	bench('[Multiple engine comparison] Publicodes 2 (cache)', () => {
		const results = []
		const c1 = Object.assign({}, contexte)
		const c2 = Object.assign({}, contexte, changes)
		;[c1, c2].forEach((c) =>
			rules.forEach((rule) => {
				results.push(newEngineAEWithCache.evaluate(rule, c))
			}),
		)
		return results
	})

	const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)
	bench('[Multiple engine comparison] Publicodes 1', () => {
		const results = []
		;[(situation, Object.assign({}, situation, changes))].forEach((s) => {
			const engine = legacyEngineAE.shallowCopy()
			engine.setSituation(s)
			rules.forEach((rule) => {
				results.push(engine.evaluate(rule))
			})
		})
		return results
	})

	const newEngineAEWithoutCache = new NewEngine(autoEntrepreneurNewRules, {
		cache: false,
	})

	bench('[Multiple engine comparison] Publicodes 2 (no cache)', () => {
		let results = []
		let c1 = Object.assign({}, contexte)
		let c2 = Object.assign({}, contexte, changes)
		;[c1, c2].forEach((c) =>
			rules.forEach((rule) => {
				results.push(newEngineAEWithoutCache.evaluate(rule, c))
			}),
		)
		return results
	})

	// bench('[Multiple engine comparison] Publicodes 2 JS (only-rules)', () => {
	// 	const results = []
	// 	const c1 = Object.assign({}, contexte)
	// 	const c2 = Object.assign({}, contexte, changes)
	// 	;[c1, c2].forEach((c) =>
	// 		rules.forEach((rule) => {
	// 			results.push(jsRules[rule](c))
	// 		}),
	// 	)
	// 	return results
	// })

	// bench(
	// 	'[Multiple engine comparison] Publicodes 2 JS (only-rules optim)',
	// 	() => {
	// 		const results = []
	// 		const c1 = Object.assign({}, contexte)
	// 		const c2 = Object.assign({}, contexte, changes)
	// 		;[c1, c2].forEach((c) =>
	// 			rules.forEach((rule) => {
	// 				results.push(jsRulesOptim[rule](c))
	// 			}),
	// 		)
	// 		return results
	// 	},
	// )

	const newEngineJs = new NewEngineJS()

	bench('[Multiple engine comparison] Publicodes 2 (JS)', () => {
		const results = []
		const c1 = Object.assign({}, contexte)
		const c2 = Object.assign({}, contexte, changes)
		;[c1, c2].forEach((c) =>
			rules.forEach((rule) => {
				results.push(newEngineJs.evaluate(rule, c))
			}),
		)
		return results
	})

	const newEngineJsWithCache = new NewEngineJS(true)

	bench('[Multiple engine comparison] Publicodes 2 JS (with cache)', () => {
		const results = []
		const c1 = Object.assign({}, contexte)
		const c2 = Object.assign({}, contexte, changes)
		;[c1, c2].forEach((c) =>
			rules.forEach((rule) => {
				results.push(newEngineJsWithCache.evaluate(rule, c))
			}),
		)
		return results
	})
})

await run({
	format: 'mitata',
	throw: true,
	// filter: /.(Multiple rules evaluated first eval|Multiple engine comparison).*/,
})
