import { run, bench, summary, do_not_optimize } from 'mitata'
import LegacyEngine from 'publicodes'

// Test data imports
import rules from './examples/simple-TJM/model.publicodes.js'
import legacyRules from './examples/simple-TJM/publicodes-build/index.js'

console.log('🚀 Publicodes Engine Benchmark - Simple TJM model\n')

// Simple Model Benchmarks
summary(() => {
	bench('[Instanciation] Publicodes 2', () => {
		return do_not_optimize(rules)
	})

	bench('[Instanciation] Publicodes 1', () => {
		return new LegacyEngine(legacyRules)
	})
})

summary(() => {
	// Simple model evaluations
	const legacyEngineSimple = new LegacyEngine(legacyRules)
	bench('[Evaluation without cache] Publicodes 2', () => {
		return rules['exemples . CA élevé'].evaluate()
	})

	bench('[Evaluation without cache] Publicodes 1', () => {
		legacyEngineSimple.resetCache()
		return legacyEngineSimple.evaluate('exemples . CA élevé')
	})
})

// Test situations
const simpleSituation = {
	"chiffre d'affaires . TJM": 10000,
	charges: 100,
}

summary(() => {
	// Pre-instantiate engines for evaluation benchmarks
	const legacyEngineSimple = new LegacyEngine(legacyRules)
	bench('[Multiple rules evaluation - with cache] Publicodes 1', () => {
		legacyEngineSimple.setSituation(simpleSituation)
		const result = []

		result.push(legacyEngineSimple.evaluate('revenu net'))
		result.push(legacyEngineSimple.evaluate('exemples . CA élevé'))
		result.push(legacyEngineSimple.evaluate('cotisations'))

		return result
	})

	bench('[Multiple rules evaluation - with cache] Publicodes 2', () => {
		const result = []
		result.push(rules['revenu net'].evaluate(simpleSituation, { cache: true }))
		result.push(
			rules['exemples . CA élevé'].evaluate(simpleSituation, { cache: true }),
		)
		result.push(rules['cotisations'].evaluate(simpleSituation, { cache: true }))

		return result
	})
})

await run({
	format: 'mitata',
	throw: true,
})
