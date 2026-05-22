import { run, bench, summary, do_not_optimize, group } from 'mitata'
import LegacyEngine from 'publicodes'
import assert from 'assert'

// Test data imports
import localRules from './model.publicodes.js'
import legacyRules from './publicodes-build/index.js'

const legacyEngineSimple = new LegacyEngine(legacyRules)

// Test situations
const simpleSituation = {
	"chiffre d'affaires . TJM": 10000,
	charges: 100,
}

const simpleSituationResults = {
	'revenu net': 87900,
	'exemples . CA élevé': 5180,
	cotisations: 72000,
}

summary(() => {
	group('Evaluation without cache', () => {
		bench('Publicodes 1', () => {
			legacyEngineSimple.resetCache()
			let res
			do_not_optimize(
				(res = legacyEngineSimple.evaluate('exemples . CA élevé').nodeValue),
			)
			assert(res === 4320, `Expected 10000, got ${res}`)
		})

		bench('Publicodes 2', () => {
			let res
			do_not_optimize((res = localRules['exemples . CA élevé'].evaluate()))
			assert(res === 4320, `Expected 10000, got ${res}`)
		})
	})

	group('Multiple rules evaluation with cache', () => {
		bench('Publicodes 1', () => {
			legacyEngineSimple.setSituation(simpleSituation)

			let revenuNet
			do_not_optimize(
				(revenuNet = legacyEngineSimple.evaluate('revenu net').nodeValue),
			)
			assert(
				revenuNet === simpleSituationResults['revenu net'],
				`Expected ${simpleSituationResults['revenu net']}, got ${revenuNet}`,
			)

			let caEleve
			do_not_optimize(
				(caEleve = legacyEngineSimple.evaluate(
					'exemples . CA élevé',
				).nodeValue),
			)
			assert(
				caEleve === simpleSituationResults['exemples . CA élevé'],
				`Expected ${simpleSituationResults['exemples . CA élevé']}, got ${caEleve}`,
			)

			let cotisations
			do_not_optimize(
				(cotisations = legacyEngineSimple.evaluate('cotisations').nodeValue),
			)
			assert(
				cotisations === simpleSituationResults['cotisations'],
				`Expected ${simpleSituationResults['cotisations']}, got ${cotisations}`,
			)
		})

		bench('Publicodes 2', () => {
			let revenuNet
			do_not_optimize(
				(revenuNet = localRules['revenu net'].evaluate(simpleSituation, {
					cache: true,
				})),
			)
			assert(
				revenuNet === simpleSituationResults['revenu net'],
				`Expected ${simpleSituationResults['revenu net']}, got ${revenuNet}`,
			)

			let caEleve
			do_not_optimize(
				(caEleve = localRules['exemples . CA élevé'].evaluate(simpleSituation, {
					cache: true,
				})),
			)
			assert(
				caEleve === simpleSituationResults['exemples . CA élevé'],
				`Expected ${simpleSituationResults['exemples . CA élevé']}, got ${caEleve}`,
			)

			let cotisations
			do_not_optimize(
				(cotisations = localRules['cotisations'].evaluate(simpleSituation, {
					cache: true,
				})),
			)
			assert(
				cotisations === simpleSituationResults['cotisations'],
				`Expected ${simpleSituationResults['cotisations']}, got ${cotisations}`,
			)
		})
	})
})

await run({
	format: 'mitata',
	throw: true,
})
