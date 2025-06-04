import { run, bench, summary } from 'mitata'
import LegacyEngine from 'publicodes'

// New engine
import NewEngine from '../dist/index.js'

// Test data imports
import simpleNewRules from '../test/simple/model.publicodes.json' assert { type: 'json' }
import simpleLegacyRules from '../test/simple/legacy-build/index.js'

console.log('🚀 Publicodes Engine Benchmark - Simple model\n')

// Simple Model Benchmarks
summary(() => {
  bench('New Engine - Instanciation', () => {
    return new NewEngine(simpleNewRules)
  })

  bench('Legacy Engine - Instanciation', () => {
    return new LegacyEngine(simpleLegacyRules)
  })
})

summary(() => {
  // Pre-instantiate engines for evaluation benchmarks
  const newEngineSimple = new NewEngine(simpleNewRules)
  const legacyEngineSimple = new LegacyEngine(simpleLegacyRules)

  // Simple model evaluations
  bench('New Engine - Evaluation', () => {
    return newEngineSimple.evaluate('exemples . CA élevé')
  })

  bench('Legacy Engine - Evaluation (without cache)', () => {
    legacyEngineSimple.resetCache()
    return legacyEngineSimple.evaluate('exemples . CA élevé')
  })

  // bench('Legacy Engine - Evaluation (with cache)', () => {
  //   return legacyEngineSimple.evaluate('revenu net')
  // })
})

// Test situations
const simpleSituation = {
  "chiffre d'affaires": 10000,
  charges: 100,
}

summary(() => {
  // Pre-instantiate engines for evaluation benchmarks
  const newEngineSimple = new NewEngine(simpleNewRules)
  const legacyEngineSimple = new LegacyEngine(simpleLegacyRules)

  // Simple model evaluations
  bench('New Engine - Evaluation with situation', () => {
    return newEngineSimple.evaluate('revenu net', simpleSituation)
  })

  bench('Legacy Engine - Evaluation with situation (without cache)', () => {
    legacyEngineSimple.setSituation(simpleSituation)
    return legacyEngineSimple.evaluate('revenu net')
  })

  legacyEngineSimple.setSituation(simpleSituation)
  bench('Legacy Engine - Evaluation (with cache)', () => {
    return legacyEngineSimple.evaluate('revenu net')
  })
})
// Memory pressure test with simple model
summary(() => {
  bench('New Engine - High frequency instantiation (Simple)', function* () {
    yield () => {
      const engines = []
      for (let i = 0; i < 100; i++) {
        engines.push(new NewEngine(simpleNewRules))
      }
      return engines.length
    }
  }).gc('inner')

  bench('Legacy Engine - High frequency instantiation (Simple)', function* () {
    yield () => {
      const engines = []
      for (let i = 0; i < 100; i++) {
        engines.push(new LegacyEngine(simpleLegacyRules))
      }
      return engines.length
    }
  }).gc('inner')
})
await run({
  format: 'mitata',
  throw: true,
})
