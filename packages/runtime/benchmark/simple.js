import { run, bench, summary, do_not_optimize } from 'mitata'
import LegacyEngine from 'publicodes'

// New engine
import NewEngine from '../dist/index.js'

// Test data imports
import simpleNewRules from '../test/simple/model.publicodes.json' assert { type: 'json' }
import simpleLegacyRules from '../test/simple/legacy-build/index.js'

console.log('🚀 Publicodes Engine Benchmark - Simple model\n')

// Simple Model Benchmarks
summary(() => {
  bench('[Instanciation] Publicodes 2', () => {
    return do_not_optimize(new NewEngine(simpleNewRules))
  })

  bench('[Instanciation] Publicodes 1', () => {
    return new LegacyEngine(simpleLegacyRules)
  })
})

summary(() => {
  // Pre-instantiate engines for evaluation benchmarks
  const newEngineSimple = new NewEngine(simpleNewRules)
  const legacyEngineSimple = new LegacyEngine(simpleLegacyRules)

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
  "chiffre d'affaires": 10000,
  charges: 100,
}

summary(() => {
  // Pre-instantiate engines for evaluation benchmarks
  const legacyEngineSimple = new LegacyEngine(simpleLegacyRules)
  bench('[Multiple rules evaluation] Publicodes 1', () => {
    legacyEngineSimple.setSituation(simpleSituation)
    const result = []

    result.push(legacyEngineSimple.evaluate('revenu net'))
    result.push(legacyEngineSimple.evaluate('exemples . CA élevé'))
    result.push(legacyEngineSimple.evaluate('cotisations'))

    return result
  })

  bench('[Multiple rules evaluation] Publicodes 2', () => {
    const newEngineSimple = new NewEngine(simpleNewRules, { cache: true })

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
