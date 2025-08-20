import Engine from '../../src/index.ts'
import rules from './model.publicodes.json' with { type: 'json' }
import JsEngine from './js-output/engine.js'
import JsEngine2 from './js-output/engine-runtime.js'

const engine = new Engine(rules)
const jsEngineWithCache = new JsEngine(true)
const jsEngineWithRuntime = new JsEngine2(true)

const context = {
  "entreprise . chiffre d'affaires . BIC": 0,
  "entreprise . chiffre d'affaires . service BIC": 10000,
  "entreprise . chiffre d'affaires . service BNC": 0,
  "entreprise . chiffre d'affaires . vente restauration hébergement": 0,
  'entreprise . activité . nature': 'libérale',
  'entreprise . activité . nature . libérale . réglementée': false,
  date: new Date('2025-05-20'),
  'dirigeant . auto-entrepreneur . Cipav . adhérent': false,
  // 'entreprise . date de création': new Date('2025-05-20'),
}

console.log(
  'revenu net',
  engine.evaluate('dirigeant . auto-entrepreneur . revenu net', context),
  context,
  jsEngineWithRuntime.evaluate(
    'dirigeant . auto-entrepreneur . revenu net',
    context,
  ),
)

// console.log(
//   'cotisations',
//   jsEngineWithRuntime.evaluate(
//     'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
//     context,
//   ),
// )
// console.timeEnd('New engine')

// console.time('JS engine (cache)')
// console.log(
//   'revenu net',
//   jsEngineWithCache.evaluate(
//     'dirigeant . auto-entrepreneur . revenu net',
//     context,
//   ),
// )
// console.log(
//   'cotisations',
//   jsEngineWithCache.evaluate(
//     'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
//     context,
//   ),
// )
// console.timeEnd('JS engine (cache)')

// console.time('JS engine with runtime (cache)')
// console.log(
//   'revenu net',
//   jsEngineWithRuntime.evaluate(
//     'dirigeant . auto-entrepreneur . revenu net',
//     context,
//   ),
// )
// console.log(
//   'cotisations',
//   jsEngineWithRuntime.evaluate(
//     'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
//     context,
//   ),
// )
// console.timeEnd('JS engine with runtime (cache)')
