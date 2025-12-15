import { run, bench, summary, do_not_optimize } from 'mitata'
import LegacyEngine from 'publicodes'

// New engine
import NewEngine from '../dist/index.js'

// Test data imports
import autoEntrepreneurNewRules from '../examples/auto-entrepreneur/model.publicodes.json' assert { type: 'json' }
import autoEntrepreneurLegacyRules from '../examples/auto-entrepreneur/build/index.js'

console.log('🚀 Publicodes Engine Benchmark - auto-entrepreneur modèle \n')

// Auto-entrepreneur Model Benchmarks
summary(() => {
	bench('[Auto-entrepreneur instantiation] Publicodes 2', () => {
		return do_not_optimize(new NewEngine(autoEntrepreneurNewRules))
	})

	bench('[Auto-entrepreneur instantiation] Publicodes 1', () => {
		return new LegacyEngine(autoEntrepreneurLegacyRules)
	})
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

	// Auto-entrepreneur model evaluations
	bench('[Evaluation without cache] Publicodes 2', () => {
		return newEngineAE.evaluate(
			'dirigeant . auto-entrepreneur . revenu net',
			contexte,
		)
	})

	bench('[Evaluation cache reset] Publicodes 1', () => {
		legacyEngineAE.setSituation(situation)
		return legacyEngineAE.evaluate('dirigeant . auto-entrepreneur . revenu net')
	})
})

summary(() => {
	const newEngineAE = new NewEngine(autoEntrepreneurNewRules, { cache: true })
	const newEngineAEWithoutCache = new NewEngine(autoEntrepreneurNewRules, {
		cache: false,
	})
	const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)

	// Auto-entrepreneur model evaluations
	bench('[Same evaluation repeated] Publicodes 2 (cache)', () => {
		return newEngineAE.evaluate(
			'dirigeant . auto-entrepreneur . revenu net',
			contexte,
		)
	})

	// Auto-entrepreneur model evaluations
	bench('[Same evaluation repeated] Publicodes 2 (no cache)', () => {
		return newEngineAEWithoutCache.evaluate(
			'dirigeant . auto-entrepreneur . revenu net',
			contexte,
		)
	})

	legacyEngineAE.setSituation(situation)
	bench('[Same evaluation repeated] Publicodes 1', () => {
		return legacyEngineAE.evaluate('dirigeant . auto-entrepreneur . revenu net')
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
		const results = []
		const c1 = Object.assign({}, contexte)
		const c2 = Object.assign({}, contexte, changes)
		;[c1, c2].forEach((c) =>
			rules.forEach((rule) => {
				results.push(newEngineAEWithoutCache.evaluate(rule, c))
			}),
		)
		return results
	})
})

await run({
	format: 'mitata',
	throw: true,
})
