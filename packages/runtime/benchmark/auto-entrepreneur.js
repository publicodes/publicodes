import { run, bench, summary, do_not_optimize } from 'mitata'
import assert from 'node:assert'
import LegacyEngine from 'publicodes'

// New engine
import { PublicodesEngine as NewEngine } from '../dist/index.js'

// Test data imports
import autoEntrepreneurNewRules from '../examples/auto-entrepreneur/model.publicodes.json' assert { type: 'json' }
import autoEntrepreneurLegacyRules from '../examples/auto-entrepreneur/publicodes-build/index.js'
import NewEngineJS from '../examples/auto-entrepreneur/model.publicodes.js'

console.log('🚀 Publicodes Engine Benchmark - auto-entrepreneur modèle \n')

// Auto-entrepreneur Model Benchmarks
summary(() => {
	bench('[Auto-entrepreneur instantiation] Publicodes 1', () => {
		return new LegacyEngine(autoEntrepreneurLegacyRules)
	})

	bench('[Auto-entrepreneur instantiation] Publicodes 2', () => {
		return do_not_optimize(new NewEngine(autoEntrepreneurNewRules))
	})

	bench('[Auto-entrepreneur instantiation] Publicodes 2 (JS)', () => {
		return do_not_optimize(new NewEngineJS())
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
	const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)
	const newEngineAE = new NewEngine(autoEntrepreneurNewRules)
	const newEngineJSAE = new NewEngineJS()

	bench('[Evaluation cache reset] Publicodes 1', () => {
		legacyEngineAE.setSituation(situation)
		return assert(
			legacyEngineAE.evaluate('dirigeant . auto-entrepreneur . revenu net')
				.nodeValue === null,
		)
	})

	// Auto-entrepreneur model evaluations
	bench('[Evaluation without cache] Publicodes 2', () => {
		return assert(
			newEngineAE.evaluate(
				'dirigeant . auto-entrepreneur . revenu net',
				contexte,
			).value === undefined,
		)
	})

	bench('[Evaluation without cache] Publicodes 2 (JS)', () => {
		return assert(
			newEngineJSAE.evaluate(
				'dirigeant . auto-entrepreneur . revenu net',
				contexte,
			).value === undefined,
		)
	})
})

summary(() => {
	const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)
	const newEngineAE = new NewEngine(autoEntrepreneurNewRules, { cache: true })
	const newEngineAEWithoutCache = new NewEngine(autoEntrepreneurNewRules, {
		cache: false,
	})
	const newEngineJSAE = new NewEngineJS(true)
	const newEngineJSAEWithoutCache = new NewEngineJS()

	legacyEngineAE.setSituation(situation)
	bench('[Same evaluation repeated] Publicodes 1', () => {
		return assert(
			legacyEngineAE.evaluate('dirigeant . auto-entrepreneur . revenu net')
				.nodeValue === null,
		)
	})

	// Auto-entrepreneur model evaluations
	bench('[Same evaluation repeated] Publicodes 2 (with cache)', () => {
		return assert(
			newEngineAE.evaluate(
				'dirigeant . auto-entrepreneur . revenu net',
				contexte,
			).value === undefined,
		)
	})

	// Auto-entrepreneur model evaluations
	bench('[Same evaluation repeated] Publicodes 2 (without cache)', () => {
		return assert(
			newEngineAEWithoutCache.evaluate(
				'dirigeant . auto-entrepreneur . revenu net',
				contexte,
			).value === undefined,
		)
	})

	// Auto-entrepreneur model evaluations
	bench('[Same evaluation repeated] Publicodes 2 (JS with cache)', () => {
		return assert(
			newEngineJSAE.evaluate(
				'dirigeant . auto-entrepreneur . revenu net',
				contexte,
			).value === undefined,
		)
	})

	// Auto-entrepreneur model evaluations
	bench('[Same evaluation repeated] Publicodes 2 (JS without cache)', () => {
		return assert(
			newEngineJSAEWithoutCache.evaluate(
				'dirigeant . auto-entrepreneur . revenu net',
				contexte,
			).value === undefined,
		)
	})
})

// FIXME: legacy engine does not return the same results as new engine
const rules = [
	{ rule: 'dirigeant . auto-entrepreneur . revenu net', value: undefined },
	{ rule: 'entreprise . activité . nature', value: 'libérale' },
	{
		rule: 'dirigeant . auto-entrepreneur . cotisations et contributions',
		value: undefined,
	},
	{
		rule: 'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
		value: undefined,
	},
	{
		rule: 'dirigeant . auto-entrepreneur . cotisations et contributions . TFC',
		value: 0,
	},
	{ rule: "entreprise . chiffre d'affaires", value: 10000 },
]

// Complex scenario benchmarks for auto-entrepreneur
summary(() => {
	const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)
	bench('[Multiple rules evaluated first eval] Publicodes 1', () => {
		legacyEngineAE.setSituation(situation)
		rules.forEach(({ rule }) => {
			legacyEngineAE.evaluate(rule)
		})
	})

	const newEngineAEWithCache = new NewEngine(autoEntrepreneurNewRules, {
		cache: true,
	})
	bench(
		'[Multiple rules evaluated first eval] Publicodes 2 (with cache)',
		() => {
			const newContexte = Object.assign({}, contexte)
			rules.forEach(({ rule, value }) => {
				assert(newEngineAEWithCache.evaluate(rule, newContexte).value === value)
			})
		},
	)

	const newEngineAEWithoutCache = new NewEngine(autoEntrepreneurNewRules, {
		cache: false,
	})
	bench(
		'[Multiple rules evaluated first eval] Publicodes 2 (without cache)',
		() => {
			const newContexte = Object.assign({}, contexte)
			rules.forEach(({ rule, value }) => {
				assert(
					newEngineAEWithoutCache.evaluate(rule, newContexte).value === value,
				)
			})
		},
	)

	const newEngineJSAEWithCache = new NewEngineJS(true)
	bench(
		'[Multiple rules evaluated first eval] Publicodes 2 (JS with cache)',
		() => {
			const newContexte = Object.assign({}, contexte)
			rules.forEach(({ rule, value }) => {
				assert(
					newEngineJSAEWithCache.evaluate(rule, newContexte).value === value,
				)
			})
		},
	)

	const newEngineJSAEWithoutCache = new NewEngineJS()
	bench(
		'[Multiple rules evaluated first eval] Publicodes 2 (JS without cache)',
		() => {
			const newContexte = Object.assign({}, contexte)
			rules.forEach(({ rule, value }) => {
				assert(
					newEngineJSAEWithoutCache.evaluate(rule, newContexte).value === value,
				)
			})
		},
	)
})

// Complex scenario benchmarks for auto-entrepreneur
summary(() => {
	const changes = {
		"entreprise . chiffre d'affaires . service BNC": 10000,
		"entreprise . chiffre d'affaires . service BIC": 10000,
	}

	const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)
	bench('[Multiple engine comparison] Publicodes 1', () => {
		;[(situation, Object.assign({}, situation, changes))].forEach((s) => {
			const engine = legacyEngineAE.shallowCopy()
			engine.setSituation(s)
			rules.forEach(({ rule }) => engine.evaluate(rule))
		})
	})

	const newEngineAEWithCache = new NewEngine(autoEntrepreneurNewRules, {
		cache: true,
	})
	bench('[Multiple engine comparison] Publicodes 2 (with cache)', () => {
		const c1 = Object.assign({}, contexte)
		const c2 = Object.assign({}, contexte, changes)
		;[(c1, c2)].forEach((c) =>
			rules.forEach(({ rule }) => newEngineAEWithCache.evaluate(rule, c)),
		)
	})

	const newEngineAEWithoutCache = new NewEngine(autoEntrepreneurNewRules, {
		cache: false,
	})
	bench('[Multiple engine comparison] Publicodes 2 (without cache)', () => {
		const c1 = Object.assign({}, contexte)
		const c2 = Object.assign({}, contexte, changes)
		;[c1, c2].forEach((c) =>
			rules.forEach(({ rule }) => newEngineAEWithoutCache.evaluate(rule, c)),
		)
	})

	const newEngineJSAEWithCache = new NewEngineJS(true)
	bench('[Multiple engine comparison] Publicodes 2 (JS with cache)', () => {
		const c1 = Object.assign({}, contexte)
		const c2 = Object.assign({}, contexte, changes)
		;[(c1, c2)].forEach((c) =>
			rules.forEach(({ rule }) => newEngineJSAEWithCache.evaluate(rule, c)),
		)
	})

	const newEngineJSAEWithoutCache = new NewEngineJS()
	bench('[Multiple engine comparison] Publicodes 2 (JS without cache)', () => {
		const c1 = Object.assign({}, contexte)
		const c2 = Object.assign({}, contexte, changes)
		;[c1, c2].forEach((c) =>
			rules.forEach(({ rule }) => newEngineJSAEWithoutCache.evaluate(rule, c)),
		)
	})
})

await run({
	format: 'mitata',
	throw: true,
})
