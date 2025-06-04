import { run, bench, summary } from 'mitata'
import LegacyEngine from 'publicodes'

// New engine
import NewEngine from '../dist/index.js'

// Test data imports
import autoEntrepreneurNewRules from '../test/auto-entrepreneur/model.publicodes.json' assert { type: 'json' }
import autoEntrepreneurLegacyRules from '../test/auto-entrepreneur/legacy-build/index.js'

console.log('🚀 Publicodes Engine Benchmark - auto-entrepreneur modèle \n')

// Auto-entrepreneur Model Benchmarks
summary(() => {
  bench('New Engine - Auto-entrepreneur instantiation', () => {
    return new NewEngine(autoEntrepreneurNewRules)
  })

  bench('Legacy Engine - Auto-entrepreneur instantiation', () => {
    return new LegacyEngine(autoEntrepreneurLegacyRules)
  })
})

const situationBuilder = ({ legacy }) => ({
  "entreprise . chiffre d'affaires . BIC": 0,
  "entreprise . chiffre d'affaires . service BIC": 10000,
  "entreprise . chiffre d'affaires . service BNC": 0,
  "entreprise . chiffre d'affaires . vente restauration hébergement": 0,
  'entreprise . activité . nature': 'libérale',
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
  bench('New Engine - Auto-entrepreneur evaluation', () => {
    return newEngineAE.evaluate(
      'dirigeant . auto-entrepreneur . revenu net',
      contexte,
    )
  })

  bench('Legacy Engine - Auto-entrepreneur evaluation - without cache', () => {
    legacyEngineAE.setSituation(situation)
    return legacyEngineAE.evaluate('dirigeant . auto-entrepreneur . revenu net')
  })
})

// Complex scenario benchmarks for auto-entrepreneur
summary(() => {
  const newEngineAE = new NewEngine(autoEntrepreneurNewRules)
  const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)

  // Multiple evaluations scenario
  bench('New Engine - Multiple evaluations (Auto-entrepreneur)', () => {
    const results = []
    results.push(
      newEngineAE.evaluate(
        'dirigeant . auto-entrepreneur . cotisations et contributions',
        contexte,
      ),
    )
    results.push(
      newEngineAE.evaluate(
        'dirigeant . auto-entrepreneur . revenu net',
        contexte,
      ),
    )
    return results
  })

  bench('Legacy Engine - Multiple evaluations (Auto-entrepreneur)', () => {
    legacyEngineAE.setSituation(situation)
    const results = []
    results.push(
      legacyEngineAE.evaluate(
        'dirigeant . auto-entrepreneur . cotisations et contributions',
      ),
    )
    results.push(
      legacyEngineAE.evaluate('dirigeant . auto-entrepreneur . revenu net'),
    )
    return results
  })
})
await run({
  format: 'mitata',
  throw: true,
})
