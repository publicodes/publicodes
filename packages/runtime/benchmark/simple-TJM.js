import { run, bench, summary, do_not_optimize } from 'mitata'
import LegacyEngine from 'publicodes'

// New engine
import NewEngine from '../dist/index.js'

// Test data imports
import newRules from '../test/simple-TJM/model.publicodes.json' assert { type: 'json' }
import legacyRules from '../test/simple-TJM/legacy-build/index.js'

console.log('🚀 Publicodes Engine Benchmark - Simple TJM model\n')

// Simple Model Benchmarks
summary(() => {
	bench('[Instanciation] Publicodes 2', () => {
		return do_not_optimize(new NewEngine(newRules))
	})

	bench('[Instanciation] Publicodes 1', () => {
		return new LegacyEngine(legacyRules)
	})
})

summary(() => {
	// Pre-instantiate engines for evaluation benchmarks
	const newEngineSimple = new NewEngine(newRules)
	const legacyEngineSimple = new LegacyEngine(legacyRules)

	// Simple model evaluations
	bench('[Evaluation without cache] Publicodes 2', () => {
		return newEngineSimple.evaluate('exemples . CA élevé')
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
		const newEngineSimple = new NewEngine(newRules, { cache: true })

		const result = []
		result.push(newEngineSimple.evaluate('revenu net', simpleSituation))
		result.push(
			newEngineSimple.evaluate('exemples . CA élevé', simpleSituation),
		)
		result.push(newEngineSimple.evaluate('cotisations', simpleSituation))

		return result
	})
})

await run({
	format: 'mitata',
	throw: true,
})
